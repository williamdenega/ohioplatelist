"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plateData, setPlateData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState("");
  const totalPlates = 1000; // Number of plates to fetch

  const facts = [
    "Did you know? Ohio was the first state to require license plates on cars, starting in 1908!",
    "Fun fact: Ohio license plates used to be made of leather in the early 1900s before switching to metal.",
    "Cool tip: Ohio's license plate design changes every few years, with past designs featuring everything from wheat fields to city skylines.",
    "Did you know? Ohio is known as the 'Birthplace of Aviation,' and this phrase was featured on their license plates for years!",
    "Interesting: Ohio has one of the highest numbers of personalized plates in the nation. Who knew Buckeyes loved custom plates so much?",
    "Ohio plates might be plain, but at least we don't need to apologize for Ann Arbor!",
    "Fun fact: Ohio is home to the Rock and Roll Hall of Fame, and some special plates feature guitars to honor this musical heritage.",
    "Did you know? Ohio has been offering veteran-themed plates since 1949, honoring those who served.",
    "In 1974, Ohio started using reflective sheeting on license plates to increase visibility at night.",
    "Ohio drivers know the only good thing about driving north is leaving Michigan behind!",
    "History bite: Ohio's Bicentennial plates in 2003 celebrated 200 years of statehood with a special design featuring the state flag."
  ];

  const fetchPlates = async (plate) => {
    try {
      const response = await axios.get('/api/proxy', {
        params: {
          plateNumber: plate,
          vehicleClass: 'PC',
          organizationCode: '0'
        },
        timeout: 10000 // 10 seconds timeout
      });

      const imgTag = response.data.match(/<img[^>]*src="[^"]*"[^>]*>/i);
      return imgTag ? imgTag[0] : null;
    } catch (error) {
      setError('Error fetching data');
      return null;
    }
  };

  useEffect(() => {
    const fetchAllPlates = async () => {
      try {
        const batchSize = 20; // Smaller batch size for smoother progress
        let allPlates = [];

        for (let i = 1; i <= totalPlates; i += batchSize) {
          const batchPromises = [];
          for (let j = i; j < i + batchSize && j <= totalPlates; j++) {
            batchPromises.push(
              fetchPlates(j).then((data) => {
                setProgress((prevProgress) => {
                  const newProgress = prevProgress + 1; // Increment by 1 for each fetch
                  return newProgress;
                });

                if (data) {
                  return { plate: j, data };
                }
                return null;
              })
            );
          }

          const batchResults = await Promise.all(batchPromises);

          // Filter out null values (plates without images) and add to allPlates
          const filteredResults = batchResults.filter(plate => plate !== null);
          allPlates = [...allPlates, ...filteredResults];
        }

        // After all batches are fetched, set the unique plates in state
        setPlateData(allPlates);
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllPlates();
  }, []);


  const progressPercentage = Math.min((progress / totalPlates) * 100, 100);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center mb-6">
          <p className="text-2xl font-semibold text-gray-800 mb-2">Checking Plates...</p>
          <p className="text-lg font-light text-gray-600">{Math.round(progressPercentage)}%</p>
        </div>
        <div className="w-full max-w-3xl bg-gray-300 rounded-full h-4 mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="mt-6 text-center text-xl font-light italic text-gray-700">{currentFact}</p> {/* Display random fact */}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Head>
        <title>BuckeyePlates</title>
        <meta name="description" content="View all available Ohio plates from 0 to 1000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mt-10">
          Welcome to BuckeyePlates
        </h1>

        <p className="mt-4 text-xl text-gray-700">
          Browse through all available plates from 0 to 1000.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-40 gap-y-6 mt-10 w-full max-w-4xl">
          {plateData.map((plate) => (
            <div
              key={plate.plate}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center"
              style={{ minHeight: '200px', width: '335px' }} // Explicitly set a larger width
            >
              <h3 className="text-2xl font-medium text-gray-800 mb-0">Plate {plate.plate}</h3>
              <div className="w-full h-full flex justify-center items-center overflow-hidden">
                <div
                  className="w-full h-auto"
                  style={{ maxHeight: '100%' }}
                  dangerouslySetInnerHTML={{ __html: plate.data }}
                />
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="w-full py-4 border-t border-gray-200 flex justify-center items-center mt-10">
        <p className="text-gray-600">&copy; {new Date().getFullYear()} Ohio Plate Checker. All rights reserved.</p>
      </footer>
    </div>
  );
}
