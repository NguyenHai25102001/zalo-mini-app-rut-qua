import React, { useEffect, useRef } from 'react';
import { Fireworks } from 'fireworks-js';

const FireworksEffect = ({ trigger }) => {
    const fireworksRef = useRef(null);

    useEffect(() => {
        if (trigger) {
            if (fireworksRef.current) {
                const fireworks = new Fireworks(fireworksRef.current, {
                    rocketsPoint: { min: 50, max: 50 },
                    hue: { min: 0, max: 360 },
                    delay: { min: 15, max: 30 },
                    particles: 50,
                    traceSpeed: 3,
                    explosion: 5,
                });


                fireworks.start();

                setTimeout(() => {
                    fireworks.stop();
                }, 10000); // Pháo hoa kéo dài trong 3 giây
            }
        }
    }, [trigger]);

    return <div ref={fireworksRef} style={{ position: 'relative', height: '100vh' }}></div>;
};

export default FireworksEffect;
