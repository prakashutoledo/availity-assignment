import React from 'react';
import './Application.css';
import { RegistrationForm } from './components/registration-form';

/**
 * Application for rendering registration for
 *
 * @constructor default constructor
 */
function Application() {
  return (
      <div className="App">
        <RegistrationForm />
      </div>
  );
}
export default Application;