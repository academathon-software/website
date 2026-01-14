import React from 'react';

import "./footer.css"

const Footer = () => {
  return (
    <footer class="footer">
      <div class="signup">
        <h3>Sign Up for Our Newsletter</h3>

        <form>
          <input type="email" placeholder="Enter your email"></input>
          <button type='submit'>Sign Up</button>
        </form>

      </div>

      <div class="social-links">
        <h3>Follow Us</h3>
        <ul>
        <li><a href="https://www.facebook.com">Facebook</a></li>
        <li><a href="https://www.twitter.com">Twitter</a></li>
        <li><a href="https://www.instagram.com">Instagram</a></li>
        </ul>
      </div>
    </footer>
   
  );
};


export default Footer;