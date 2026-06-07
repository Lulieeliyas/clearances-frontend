// src/utils/hash.js (create this file)
import CryptoJS from 'crypto-js';

// Use the same salt on both frontend and backend
const PASSWORD_SALT = "MAU_CLEARANCE_SYSTEM_2024_SECURE_SALT";

/**
 * Hash password with SHA-256 and salt
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
export const hashPassword = (password) => {
  if (!password) return '';
  const saltedPassword = password + PASSWORD_SALT;
  return CryptoJS.SHA256(saltedPassword).toString();
};

/**
 * Verify if a password matches a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password to compare against
 * @returns {boolean} - Whether the password matches
 */
export const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};