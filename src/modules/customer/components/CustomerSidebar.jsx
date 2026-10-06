import { NavLink } from 'react-router-dom';
export default function CustomerSidebar(){return <nav aria-label="Customer account navigation" className="flex flex-col gap-2"><NavLink to="/account" end>Overview</NavLink><NavLink to="/account/bookings">My bookings</NavLink><NavLink to="/account/profile">Profile</NavLink></nav>;}
