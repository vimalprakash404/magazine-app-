import { useState, useEffect } from 'react';

function useWindowHeight() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures that effect only runs on mount and unmount

  return windowHeight;
}

export default useWindowHeight;
