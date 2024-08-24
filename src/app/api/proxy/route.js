// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const cache = new Map();
// const TTL = 60000; // Cache expires after 60 seconds (1 minute)

// export async function GET(request) {
//     const { searchParams } = new URL(request.url);
//     const plateNumber = searchParams.get('plateNumber');
//     const vehicleClass = searchParams.get('vehicleClass');
//     const organizationCode = searchParams.get('organizationCode');
//     const cacheKey = `${plateNumber}-${vehicleClass}-${organizationCode}`;

//     // Check cache and TTL
//     const cachedData = cache.get(cacheKey);
//     if (cachedData && (Date.now() - cachedData.timestamp < TTL)) {
//         console.log('Serving from cache and revalidating in the background');

//         // Revalidate in the background
//         revalidateCache(cacheKey, plateNumber, vehicleClass, organizationCode);

//         return NextResponse.json(cachedData.data);
//     }

//     try {
//         const response = await fetchAndCache(cacheKey, plateNumber, vehicleClass, organizationCode);
//         return NextResponse.json(response.data);
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         return NextResponse.json({ error: 'Error fetching data' }, { status: 500 });
//     }
// }

// // Function to fetch data and cache it
// async function fetchAndCache(cacheKey, plateNumber, vehicleClass, organizationCode) {
//     try {
//         const response = await axios.get('https://bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview', {
//             params: {
//                 plateNumber,
//                 vehicleClass,
//                 organizationCode,
//             },
//         });
//         // Store the response in cache with timestamp
//         cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
//         return response;
//     } catch (error) {
//         throw new Error('Error fetching data from API');
//     }
// }

// // Function to revalidate cache in the background
// function revalidateCache(cacheKey, plateNumber, vehicleClass, organizationCode) {
//     axios.get('https://bmvonline.dps.ohio.gov/bmvonline/oplates/PlatePreview', {
//         params: {
//             plateNumber,
//             vehicleClass,
//             organizationCode,
//         },
//     }).then(response => {
//         cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
//         console.log('Cache revalidated');
//     }).catch(error => {
//         console.error('Error revalidating data:', error);
//     });
// }



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
        console.log('Serving from cache');
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
