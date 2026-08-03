import { XIcon, CheckCircleIcon, BadgeInfoIcon, GlobeIcon, UserIcon } from "lucide-react";
import { useEffect } from "react";

const ListingDetailsModal = ({ listing, onClose }) => {
    
    const currency = import.meta.env.VITE_CURRENCY || "$";

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] backdrop-blur flex items-center justify-center sm:p-4">
            <div className="bg-white dark:bg-gray-900 sm:rounded-lg w-full max-w-2xl h-screen sm:h-[600px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">{listing.title}</h3>
                        <p className="text-sm text-indigo-100">
                            @{listing.username} on {listing.platform}
                        </p>
                    </div>
                    <button onClick={onClose} className="ml-4 p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-5 text-gray-700 dark:text-gray-300">
                    {/* Image Carousel */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-x-auto">
                        {listing.images?.map((img, i) => (
                            <img key={i} src={img} alt={`${listing.title}-${i}`} className=" rounded-lg border border-gray-200 dark:border-gray-800" />
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Followers</p>
                            <p className="text-indigo-600 font-semibold">{listing.followers_count?.toLocaleString()}</p>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Engagement Rate</p>
                            <p className="text-indigo-600 font-semibold">{listing.engagement_rate}%</p>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Monthly Views</p>
                            <p className="text-indigo-600 font-semibold">{listing.monthly_views?.toLocaleString()}</p>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Niche</p>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold capitalize">{listing.niche}</p>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Country</p>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">{listing.country}</p>
                        </div>
                        <div className="p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <p className="font-medium">Age Range</p>
                            <p className="text-gray-800 dark:text-gray-100 font-semibold">{listing.age_range}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="font-semibold mb-1 flex items-center gap-1">
                            <BadgeInfoIcon className="w-4 h-4 text-indigo-500" /> Description
                        </h4>
                        <p className="text-sm leading-relaxed">{listing.description}</p>
                    </div>

                    {/* Status / Verification */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${listing.status === "active" ? "bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>{listing.status?.toUpperCase()}</span>
                        {listing.verified && (
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-300 text-xs font-semibold bg-indigo-100 dark:bg-indigo-500/15 px-2 py-1 rounded-full">
                                <CheckCircleIcon size={14} /> Verified
                            </span>
                        )}
                        {listing.monetized && <span className="text-xs font-semibold bg-yellow-100 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 px-2 py-1 rounded-full">Monetized</span>}
                        {listing.featured && <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">Featured</span>}
                        {listing.platformAssured && <span className="text-xs font-semibold bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 px-2 py-1 rounded-full">Platform Assured</span>}
                    </div>

                    {/* Owner Info */}
                    {listing.owner && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Owner
                            </h4>
                            <div className="flex items-center gap-3">
                                <img src={listing.owner.image} alt={listing.owner.name} className="size-8 rounded-full object-cover border border-gray-200 dark:border-gray-800" />
                                <div>
                                    <p className="font-medium">{listing.owner.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{listing.owner.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
                    {listing.customer && (
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                            <h4 className="font-semibold mb-2 flex items-center gap-1">
                                <UserIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> Customer
                            </h4>
                            <div className="flex items-center gap-3">
                                <img src={listing.customer.image} alt={listing.customer.name} className="size-8 rounded-full object-cover border border-gray-200 dark:border-gray-800" />
                                <div>
                                    <p className="font-medium">{listing.customer.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{listing.customer.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Section */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <GlobeIcon size={15} /> Listed on {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-lg font-semibold text-indigo-600">{currency}{listing.price?.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsModal;
