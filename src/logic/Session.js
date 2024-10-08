import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { Renderer } from './Renderer.js'
import { Notify } from './Notification.js'

/**
 * The `Session` class handles user authentication, session management, and interaction with Supabase's auth API.
 * It includes methods for creating users, logging in, signing out, password management, and session retrieval.
 */
export class Session {

    static #anonKey
    static #client
    static #databaseUrl
    static #isLoggedIn = false
    static #user

    /**
     * Adds an event listener to handle different authentication state changes, such as sign-in, sign-out, and session refresh.
     */
    static addEventListener() {

        Session.#client.auth.onAuthStateChange(event => {

            switch (event) {
                
                case 'INITIAL_SESSION':

                    console.log('session created')

                    break
    
                case 'SIGNED_IN':

                    console.log('user is logged in')

                    this.#isLoggedIn = true

                    Renderer.render(null, 'auth')

                    break
    
                case 'SIGNED_OUT':

                    console.log('user is logged out')

                    this.#isLoggedIn = false

                    Renderer.render(null, 'auth')

                    break
    
                case 'PASSWORD_RECOVERY':

                    console.log('password reset')

                    break
    
                case 'TOKEN_REFRESHED':

                    console.log('session refreshed')

                    break
    
                case 'USER_UPDATED':

                    console.log('user info updated')

                    break
    
                default:

                    console.log('Unhandled event:', event)

                    break

            }
            
        })

    }

    /**
     * Creates a new user account with the provided email and password.
     * 
     * @param {Object} param - An object containing the email and password.
     * @param {string} param.email - The email address for the new account.
     * @param {string} param.password - The password for the new account.
     * @returns {Promise<Object>} - Returns the user object on successful account creation.
     * @throws {Error} - Throws an error if account creation fails.
     */
    static async createUser({ email, password }) {

        try {

            const { data, error } = await Session.#client.auth.signUp({ email, password })

            if (!data.user || error) throw new Error(error.message)

            Session.#user = data.user

            Session.#isLoggedIn = true

            new Notify('A verification link has been sent to your email.', 'information')

            return data.user

        } catch (error) { new Notify(`${error.message}.`, "error") }

    }

    /**
     * Returns the Supabase client instance.
     * 
     * @returns {Object} - The Supabase client instance.
     */
    static getClient() { return this.#client }

    /**
     * Generates a session URL containing the current user's ID as a hash.
     * 
     * @returns {string} - The generated session URL.
     */
    static generateSessionUrl() {

        const domain = window.location.href

        const userId = Session.getUser().id

        return domain + '#' + userId

    }

    /**
     * Returns the current logged-in user.
     * 
     * @returns {Object|null} - The user object if logged in, otherwise `null`.
     */
    static getUser() { return Session.#user }

    /**
     * Retrieves the user ID from the URL hash if the user is not logged in.
     * 
     * @returns {string|null} - The extracted user ID from the hash, or `null` if not available.
     */
    static getIdFromUrlHash() {

        if (!this.getUser()) {

            const page = window.location.hash

            const userId = page.slice(page.indexOf('#') + 1)

            return userId

        }

    }

    /**
     * Retrieves the user's profile details from the database.
     * 
     * @returns {Promise<Object>} - The profile data of the logged-in user.
     * @throws {Error} - Throws an error if the user is not logged in or if fetching profile data fails.
     */
    static async getUserDetails() {

        try {
            
            if (!Session.#isLoggedIn) throw new Error('User is not logged in.')

            const { data, error } = await Session.#client.from('profiles').select('*').eq('id', Session.#user.id).single()
    
            if (error) throw new Error(error.message)
    
            return data

        } catch (error) { console.error("Error in getUserDetails: ", error.message) }

    }

    /**
     * Initializes the session by setting the Supabase client and user state.
     * Also adds event listeners and refreshes the session if needed.
     * 
     * @returns {Promise<void>}
     */
    static async initialize() {

        try {
            
            Session.#anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2eHRqc3Jxcmp3aHRteGt6d2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIxODA1ODYsImV4cCI6MjAzNzc1NjU4Nn0.tpsW736ywZy-CHU5lkm0zcOZo_PwbUpuAwwVd7lXqUU'

            Session.#databaseUrl = 'https://cvxtjsrqrjwhtmxkzwbz.supabase.co'

            Session.#client = createClient(Session.#databaseUrl, Session.#anonKey)

            Session.#user = null

            Session.addEventListener()

            await Session.refreshSession()

        } catch (error) { console.error("Error in initialize: ", error.message) }

    }

    /**
     * Checks whether the user is currently logged in.
     * 
     * @returns {boolean} - Returns `true` if the user is logged in, otherwise `false`.
     */
    static isLoggedIn() { return Session.#isLoggedIn }

    /**
     * Refreshes the current session, updating the user state if necessary.
     * 
     * @returns {Promise<Object|null>} - Returns the user object if refreshed successfully, or `null` if an error occurs.
     */
    static async refreshSession() {

        try {
            
            const { data, error } = await Session.#client.auth.refreshSession()

            if (error) throw new Error(error.message)

            Session.#user = data.session?.user ?? null

            Session.#isLoggedIn = !!Session.#user

            return Session.#user

        } catch (error) {
            
            console.error('Error in refreshSession:', error.message)

            return null

        }

    }

    /**
     * Sends a password reset email to the provided email address.
     * 
     * @param {string} email - The email address to send the reset link to.
     * @returns {Promise<string>} - A message indicating that the password reset email was sent.
     * @throws {Error} - Throws an error if the reset email fails to send.
     */
    static async resetPassword(email) {

        try {
            
            const { error } = await Session.#client.auth.resetPasswordForEmail(email)

            if (error) throw new Error(error.message)

            return 'Password reset email sent.'

        } catch (error) { console.error("Error in resetPassword: ", error.message) }

    }

    /**
     * Retrieves the current session and updates the logged-in state.
     * 
     * @returns {Promise<Object|null>} - Returns the user object if a session is active, or `null` if not.
     * @throws {Error} - Throws an error if session retrieval fails.
     */
    static async retrieveSession() {

        try {
            
            const { data, error } = await Session.#client.auth.getSession()

            if (error) throw new Error(error.message)

            Session.#user = data.session?.user ?? null

            Session.#isLoggedIn = !!Session.#user

            return Session.#user

        } catch (error) { console.error("Error in retrieveSession: ", error.message) }

    }

    /**
     * Signs in a user using the provided email and password.
     * 
     * @param {Object} param - An object containing the email and password.
     * @param {string} param.email - The user's email address.
     * @param {string} param.password - The user's password.
     * @returns {Promise<Object>} - Returns the user object on successful sign-in.
     * @throws {Error} - Throws an error if sign-in fails.
     */
    static async signInUser({ email, password }) {

        try {
            
            const { data, error } = await Session.#client.auth.signInWithPassword({ email, password })

            if (data.user) {

                Session.#user = data.user

                Session.#isLoggedIn = true

                new Notify('Login successful, welcome!', 'success')

                return data.user

            } else throw new Error(error.message)

        } catch (error) { new Notify(`${error.message}. Please try again.`, "error") }

    }

    /**
     * Signs out the current user and updates the session state.
     * 
     * @returns {Promise<Object|null>} - Returns `null` on successful sign-out.
     * @throws {Error} - Throws an error if sign-out fails.
     */
    static async signOutUser() {

        try {
            
            const { error } = await Session.#client.auth.signOut()

            if (error) throw new Error(error.message)

            Session.#user = null

            Session.#isLoggedIn = false

            return Session.#user

        } catch (error) { console.error("Failed to logout user: ", error.message) }

    }

    /**
     * Updates the password of the logged-in user.
     * 
     * @param {string} newPassword - The new password to set.
     * @returns {Promise<string>} - A message indicating that the password was updated.
     * @throws {Error} - Throws an error if password update fails.
     */
    static async updatePassword(newPassword) {

        try {
            
            const { error } = await Session.#client.auth.updateUser({ password: newPassword })

            if (error) throw new Error(error.message)

            return 'Password updated successfully.'

        } catch (error) { console.error("Error in updatePassword: ", error.message) }

    }

    /**
     * Updates the logged-in user's profile with the provided details.
     * 
     * @param {Object} updates - An object containing the profile fields to update.
     * @returns {Promise<Object>} - Returns the updated user object.
     * @throws {Error} - Throws an error if profile update fails.
     */
    static async updateUserProfile(updates) {

        try {
            
            const { user, error } = await Session.#client.auth.updateUser(updates)

            if (error) throw new Error(error.message)

            Session.#user = user

            return user

        } catch (error) { console.error("Error in updateUserProfile: ", error.message) }

    }

}