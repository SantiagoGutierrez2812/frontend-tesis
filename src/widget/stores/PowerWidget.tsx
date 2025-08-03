import { useEffect, useState } from 'react';

const PowerWidget = () => {
  const [power, setPower] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
      setPower(Math.floor(Math.random() * 100) + 50);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <h3 className="text-xl font-semibold mb-2">Power Consumption</h3>
      <p className="text-4xl">{power} W</p>
    </div>
  );
};

export default PowerWidget;

