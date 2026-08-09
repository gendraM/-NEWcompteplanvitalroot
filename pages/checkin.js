import React, { useState } from 'react';

export default function CheckIn() {
    const [mood, setMood] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div style={{maxWidth:600,margin:'0 auto',padding:'2rem'}}>
            <h1>Humeur du jour</h1>
            {submitted ? (
                <p>Merci d'avoir partagé votre humeur !</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label>
                        Comment vous sentez-vous aujourd'hui ?
                        <input
                            type="text"
                            value={mood}
                            onChange={(e) => setMood(e.target.value)}
                            required
                            style={{display:'block',marginTop:'0.5rem',padding:'0.5rem',width:'100%'}}
                        />
                    </label>
                    <button type="submit" style={{marginTop:'1rem',padding:'0.5rem 1rem'}}>
                        Soumettre
                    </button>
                </form>
            )}
        </div>
    );
}
