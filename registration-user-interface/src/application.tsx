import React from 'react';
import './application.css';
import { RegistrationForm } from './components/registration-form';

/**
 * Application for rendering registration for
 *
 * @constructor default constructor
 */
function Application() {
  return (
      <div className="Application">
        <RegistrationForm />
      </div>
  );
}
export default Application;