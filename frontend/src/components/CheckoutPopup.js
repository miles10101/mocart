import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import supabase from '../supabaseClient';

const CheckoutPopup = ({ onSubmit, onCancel }) => {
  const email = useSelector((state) => state.email); // Get email from Redux
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [station, setStation] = useState('');
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Fetch and populate the country dropdown on component mount
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabase
          .from('pickup_locations')
          .select('country')
          .order('country', { ascending: true });

        if (error) {
          console.error('Error fetching countries:', error);
        } else {
          // Extract unique countries
          const uniqueCountries = [...new Set(data.map(item => item.country))];
          setCountries(uniqueCountries);
        }
      } catch (err) {
        console.error('Exception fetching countries:', err);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = async (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setRegion('');
    setStation('');

    // Fetch and populate the region dropdown based on selected country
    try {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('region')
        .eq('country', selectedCountry)
        .order('region', { ascending: true });

      if (error) {
        console.error('Error fetching regions:', error);
      } else {
        // Extract unique regions
        const uniqueRegions = [...new Set(data.map(item => item.region))];
        setRegions(uniqueRegions);
        setStations([]); // Reset stations dropdown
      }
    } catch (err) {
      console.error('Exception fetching regions:', err);
    }
  };

  const handleRegionChange = async (e) => {
    const selectedRegion = e.target.value;
    setRegion(selectedRegion);
    setStation('');

    // Fetch and populate the station dropdown based on selected region
    try {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('station')
        .eq('country', country)
        .eq('region', selectedRegion)
        .order('station', { ascending: true });

      if (error) {
        console.error('Error fetching stations:', error);
      } else {
        // Extract unique stations
        const uniqueStations = [...new Set(data.map(item => item.station))];
        setStations(uniqueStations);
      }
    } catch (err) {
      console.error('Exception fetching stations:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, phoneNumber, pickupLocation: `${country}, ${region}, ${station}` });
  };

  return (
    <div className="checkout-popup">
      <form onSubmit={handleSubmit}>
        <label>
          Phone Number:
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>
        <label>
          Country:
          <select value={country} onChange={handleCountryChange} required>
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label>
          Region:
          <select value={region} onChange={handleRegionChange} required>
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>
        <label>
          Station:
          <select value={station} onChange={(e) => setStation(e.target.value)} required>
            <option value="">Select Station</option>
            {stations.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">OK</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
};

export default CheckoutPopup;
