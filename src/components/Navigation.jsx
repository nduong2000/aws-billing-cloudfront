import React from 'react';
import { NavLink } from 'react-router-dom';

function Navigation() {
    return (
        <nav>
            <ul>
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/patients">Patients</NavLink></li>
                <li><NavLink to="/providers">Providers</NavLink></li>
                <li><NavLink to="/services">Services</NavLink></li>
                <li><NavLink to="/appointments">Appointments</NavLink></li>
                <li><NavLink to="/claims">Claims</NavLink></li>
                <li><NavLink to="/audit">Audit</NavLink></li>
                {/* Add other links as needed */}
            </ul>
        </nav>
    );
}

export default Navigation; 