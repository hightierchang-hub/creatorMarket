import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../configs/axios';

// Get all public listings
export const getAllPublicListing = createAsyncThunk("listing/getAllPublicListing",
    async () => {
        try {
            const { data } = await api.get('/api/listing/public')
            return data;
        } catch (error) {
            console.log(error);
            return { listings: [] };
        }
    }
)

// Get all user listings
export const getAllUserListing = createAsyncThunk("listing/getAllUserListing",
    async ({ getToken }) => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('Failed to get authentication token');
                return {
                    listings: [],
                    balance: { earned: 0, withdrawn: 0, available: 0 }
                };
            }
            const { data } = await api.get('/api/listing/user', {
                headers: { Authorization: `Bearer ${token}` }
            })
            return data
        } catch (error) {
            console.log('Error fetching user listings:', error);
            return {
                listings: [],
                balance: { earned: 0, withdrawn: 0, available: 0 }
            };
        }
    }
)
const listingSlice = createSlice({
    name: 'listing',
    initialState: {
        listing: [],
        userListings: [],
        balance: {
            earned: 0,
            withdrawn: 0,
            available: 0
        }
    },
    reducers: {
        setListing: (state, action) => {
            state.listing = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAllPublicListing.fulfilled, (state, action) => {
            state.listing = action.payload?.listings ?? [];
        });
        builder.addCase(getAllUserListing.fulfilled, (state, action) => {
            state.userListings = action.payload?.listings ?? [];
            state.balance = action.payload?.balance ?? {
                earned: 0,
                withdrawn: 0,
                available: 0
            };
        });
    }
})

export const { setListing } = listingSlice.actions
export default listingSlice.reducer