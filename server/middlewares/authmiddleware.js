import { verifyToken, clerkClient } from '@clerk/express';

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

        let userId = null;
        let hasPremium = false;

        if (typeof req.auth === 'function') {
            try {
                const auth = await req.auth();
                userId = auth?.userId ?? null;
                if (auth?.has) {
                    hasPremium = await auth.has({ plan: 'premium' });
                }
            } catch (authError) {
                console.log('Clerk auth lookup failed:', authError.message);
            }
        }

        if (!userId && token) {
            try {
                const decoded = await verifyToken(token, {
                    secretKey: process.env.CLERK_SECRET_KEY,
                    clockSkewInMs: 60000, // allow 60s clock skew for local dev
                });
                userId = decoded.sub ?? decoded.userId ?? decoded.user_id ?? null;
            } catch (tokenError) {
                console.log('Token verification failed:', tokenError.message);
            }
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.auth = async () => ({
            userId,
            has: async () => hasPremium,
        });
        req.userId = userId;
        req.plan = hasPremium ? 'premium' : 'free';

        return next();
    } catch (error) {
        console.log('Auth middleware error:', error);
        res.status(401).json({ message: error.code || error.message });
    }
};

export const protectAdmin = async (req, res, next) => {
    try {
        const authData = typeof req.auth === 'function' ? await req.auth() : null;
        const userId = authData?.userId ?? req.userId ?? null;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await clerkClient.users.getUser(userId);
        const adminEmails = (process.env.ADMIN_EMAILS || '')
            .split(',')
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean);

        const emailAddress = user?.emailAddresses?.[0]?.emailAddress
            || user?.primaryEmailAddress?.emailAddress
            || '';
        const isAdmin = adminEmails.includes(emailAddress.toLowerCase());

        if (!isAdmin) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.adminUser = user;
        return next();
    } catch (error) {
        console.log('Admin auth error:', error);
        return res.status(401).json({ message: error.code || error.message });
    }
};