import { useEffect, useState } from 'react';

const HumidityWidget = () => {
  const [humidity, setHumidity] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setHumidity(Math.floor(Math.random() * 20) + 40);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">Humidity</h3>
      <p className="text-3xl">{humidity}%</p>
    </div>
  );
};

export default HumidityWidget;
