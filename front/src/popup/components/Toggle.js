import React, { useEffect, useState } from 'react';

const Toggle = () => {
    const [data, setData] = useState('');
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        chrome.storage.local.get('bjhEnable', (result) => {
            if (result.bjhEnable === undefined) {
                chrome.storage.local.set({ bjhEnable: true });
            }
            setIsEnabled(result.bjhEnable);
        });
    }, []);

    const handleSave = () => {
        const request = indexedDB.open('MyDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('MyStore', { keyPath: 'id' });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('MyStore', 'readwrite');
            const store = transaction.objectStore('MyStore');
            store.put({ id: 'myData', value: data });

            transaction.oncomplete = () => {
                // console.log('Data saved to IndexedDB');
            };
        };

        request.onerror = (event) => {
            // console.error('Error opening IndexedDB', event);
        };
    };

    const handleToggle = () => {
        setIsEnabled(!isEnabled);
        chrome.storage.local.set({ bjhEnable: !isEnabled });
    };

    return (
        <div>
            <input 
                type="text" 
                value={data} 
                onChange={(e) => setData(e.target.value)} 
                placeholder="Enter data"
            />
            <button onClick={handleSave}>Save</button>
            <div className="ui grid container">
                <div className="sixteen wide center aligned column">
                    <h1 id="title">Baekjoon<span style={{ color: '#0078c3' }}>Hub</span></h1>
                    <p id="caption">Sync your code from BOJ to GitHub</p>
                    <br />
                    <div style={{ marginTop: '10px' }}>
                        <input type="checkbox" id="onffbox" checked={isEnabled} onChange={handleToggle}/>
                        <label htmlFor="onffbox" id="onffmain">
                            <span id="onffball">나와라진짜</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toggle