'use client';

import { useState, useEffect } from 'react';
import './globals.css'; 
import { carMakes } from '../lib/carMakes';

interface CarInfo {
  features: string[];
}

export default function Home() {
  const [year, setYear] = useState<string>('');
  const [make, setMake] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [carInfo, setCarInfo] = useState<CarInfo | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year, make, model }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Log the API response for debugging
      setCarInfo(data);
    } catch (error) {
      console.error('Error fetching car information:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-center mb-8">Car Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div>
            <input
              type="text"
              id="year"
              value={year}
              placeholder='Year'
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div>
            <select
              id="make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            >
              {carMakes.map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              id="model"
              value={model}
              placeholder='Model'
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>

      {isClient && carInfo && carInfo.features && carInfo.features.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Car Features:</h2>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {carInfo.features.map((feature, index) => {
                const [featureName, featureValue] = feature.split(': ');
                return (
                  <tr key={index}>
                    <td>{featureName}</td>
                    <td>{featureValue}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        carInfo && carInfo.features && carInfo.features.length === 0 ? (
          <div className="message">No features found for this car.</div>
        ) : (
          !carInfo || !carInfo.features ? (
            <div className="message">Please submit a valid car make, model, and year.</div>
          ) : null
        )
      )}
    </div>
  );
}