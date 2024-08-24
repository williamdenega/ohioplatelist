import { NextResponse } from 'next/server';
import axios from 'axios';


const cache = new Map();
const TTL = 60000; // Cache expires after 60 seconds (1 minute)

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const plateNumber = searchParams.get('plateNumber');
    const vehicleClass = searchParams.get('vehicleClass');
    const organizationCode = searchParams.get('organizationCode');
    const cacheKey = `${plateNumber}-${vehicleClass}-${organizationCode}`;

    // Check cache and TTL
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < TTL)) {
        console.log('Serving from cache and revalidating in background');

        // Revalidate in the background
        axios.get('https://bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview', {
            params: {
                plateNumber,
                vehicleClass,
                organizationCode,
            },
        }).then(response => {
            cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
        }).catch(error => {
            console.error('Error revalidating data:', error);
        });

        return NextResponse.json(cachedData.data);
    }

    try {
        const response = await axios.get('https://bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview', {
            params: {
                plateNumber,
                vehicleClass,
                organizationCode,
            },
        });

        // Store the response in cache with timestamp
        cache.set(cacheKey, { data: response.data, timestamp: Date.now() });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
    }
}
