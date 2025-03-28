import React, { useState } from "react";

const Survey = () => {
    const [formData, setFormData] = useState({
        major: '',
        standing: '',
        status: '',
        desiredClasses: '',
        avoidClasses: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div>
            {!submitted ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Student Status:</label>
                        <div>
                            <label>
                                <input 
                                    type="radio" 
                                    name="status" 
                                    value="Full-time" 
                                    onChange={handleChange} 
                                    required 
                                /> Full-time
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    name="status" 
                                    value="Part-time" 
                                    onChange={handleChange} 
                                    required 
                                /> Part-time
                            </label>
                        </div>
                    </div>

                    <div>
                        <label>Major:</label>
                        <select name="major" value={formData.major} onChange={handleChange} required>
                            <option value="">Select your Major</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Business">Business</option>
                            <option value="Biology">Biology</option>
                        </select>
                    </div>

                    <div>
                        <label>Current Standing:</label>
                        <select name="standing" value={formData.standing} onChange={handleChange} required>
                            <option value="">Select your Standing</option>
                            <option value="Freshman">Freshman</option>
                            <option value="Sophomore">Sophomore</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                        </select>
                    </div>

                    <div>
                        <label>Classes You Want To Take:</label>
                        <textarea 
                            name="desiredClasses" 
                            value={formData.desiredClasses} 
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Classes You Want To Avoid:</label>
                        <textarea 
                            name="avoidClasses" 
                            value={formData.avoidClasses} 
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit">Submit</button>
                </form>
            ) : (
                <div>
                    <h2>Form Submitted Successfully</h2>
                    <button onClick={() => setSubmitted(false)}>Fill Another Form</button>
                </div>
            )}
        </div>
    );
};

export default Survey;
