import { Link } from './Link.js'
import { Renderer } from './Renderer.js'
import { Profile } from './Profile.js'
import { LocalStorage } from './LocalStorage.js'
import { Session } from './Session.js'
import { Database } from './Database.js'
import { VersionControl } from './VersionControl.js'

/**
 * Initializes the application by setting up the `Renderer` context, loading session data, 
 * and enabling drag-and-drop functionality for links. It also manages the creation of new links 
 * and profile page interactions.
 *
 * @event DOMContentLoaded - Executes when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async (event) => {

    // Preloads the Renderer with context data, including link containers, profile form, and platform data.
    Renderer.context = { 

        linkParent: document.querySelector('.link-body'), // Container for rendering created links

        linkPreviewParent: document.querySelector('.link-preview'), // Container for rendering mobile previews

        profileForm: document.querySelector('.profile-form'), // Container for profile form 

        // Platform data including title, icon, and URL patterns for each platform
        platformData: [

            { title: 'GitHub', icon: 'github', urlPattern: 'github.com', color: '#8E8E93' },
            { title: 'YouTube', icon: 'youtube', urlPattern: 'youtube.com', color: '#EE3939' },
            { title: 'Frontend Mentor', icon: 'frontend-mentor', urlPattern: 'frontendmentor.io', color: '#FFFFFF' },
            { title: 'X', icon: 'x', urlPattern: 'x.com', color: '#43B7E9' },
            { title: 'LinkedIn', icon: 'linkedin', urlPattern: 'linkedin.com', color: '#2D68FF' },
            { title: 'Facebook', icon: 'facebook', urlPattern: 'facebook.com', color: '#2442AC' },
            { title: 'Twitch', icon: 'twitch', urlPattern: 'twitch.tv', color: '#EE3FC8' },
            { title: 'Dev.to', icon: 'devto', urlPattern: 'dev.to', color: '#EAF0F1' },
            { title: 'Codewars', icon: 'codewars', urlPattern: 'codewars.com', color: '#8A1A50' },
            { title: 'Codepen', icon: 'codepen', urlPattern: 'codepen.io', color: '#1e1f26' },
            { title: 'freeCodeCamp', icon: 'freecodecamp', urlPattern: 'freecodecamp.org', color: '#302267' },
            { title: 'GitLab', icon: 'gitlab', urlPattern: 'gitlab.com', color: '#EB4925' },
            { title: 'Hashnode', icon: 'hashnode', urlPattern: 'hashnode.com', color: '#0330D1' },
            { title: 'Stack Overflow', icon: 'stack-overflow', urlPattern: 'stackoverflow.com', color: '#EC7100' }

        ]

    }

    await Session.initialize() // Loads or initializes stored data from local storage and the database using VersionControl.

    const storedData = await VersionControl.intialize(new LocalStorage('link-app'), new Database())

    let profile = new Profile(storedData.profile) // Creates or loads an existing profile.

    Renderer.manageNavbar() // Toggles navigation burger and menu states

    if (Renderer.context.linkParent) Renderer.enableDragAndDrop() // Enables drag-and-drop functionality for the link elements if they exist in the DOM.

    const createLinkButton = document.querySelector('.link-container > button') // Adds event listener to create a new generic link when the "Create Link" button is clicked.
    
    if (createLinkButton) createLinkButton.addEventListener('click', e => new Link({}) )    
        
    // Sets up profile page interactions, including uploading a profile image. Clicking on the profile image container triggers the file input for selecting an image.
    if (Renderer.context.profileForm) {

        const profileImageContainer = document.querySelector('.add-profile-input')

        const inputFile = profileImageContainer.querySelector('input')

        profileImageContainer.addEventListener('click', e => inputFile.click())

    }

})