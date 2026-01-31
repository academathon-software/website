import './Sidebar.css';
import { Link, NavLink } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faSearch, faEnvelope, faClose, faBars, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import logoImg from '../../assets/logo.avif'

const Sidebar = () => {
    const [showNav, setShowNav] = useState(false)

    const closeNav = () => {
        setShowNav(false);
    };

    return (
        <div className='nav-bar'>
            <Link className="logo" to="/">
                <img src={logoImg} alt="Academathon" className="logo-img" />
                <span className="coming-soon-tag">Coming Soon</span>
            </Link>
            <nav className={showNav ? 'mobile-show' : ""}>
                <NavLink exact="true" activeClassName="active" to="/" onClick={closeNav}>
                    <span>Home</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="about-link" to="/about" onClick={closeNav}>
                    <span>About Us</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="contact-link" to="/team" onClick={closeNav}>
                    <span>Our Team</span>
                </NavLink>
                <NavLink exact="true" activeClassName="active" className="dashboard-link" to="/pricing" onClick={closeNav}>
                    <span>Pricing</span>
                </NavLink>
                <FontAwesomeIcon icon={faClose} size="3x" className="close-icon" onClick={closeNav} />
            </nav>
            <FontAwesomeIcon onClick={() => setShowNav(!showNav)} icon={faBars} size="3x" className="hamburger-icon" />
        </div>
    )

}

export default Sidebar