import { LocalStorage } from "./LocalStorage.js"
import { Renderer } from "./Renderer.js"
import { Link } from './Link.js'

export class Profile {

    firstName
    lastName
    email
    url
    imageString
    loginView
    linkArray = []

    constructor(data = {}) {

        this.firstName = data.firstName ?? null

        this.lastName = data.lastName ?? null

        this.email = data.email ?? null

        this.url = data.url ?? null

        this.imageString = data.imageString ?? null

        this.loginView = data.loginView ?? "login"

        if (Object.keys(data).length > 0) {

            const reconstructedLinkArray = data.linkArray.reduce((accumulator, link) => {

                link.platformData.urlPattern = new RegExp(link.platformData.urlPattern.slice(1, -1))
        
                accumulator.push(new Link(link))
        
                return accumulator

            }, [])

            this.addLink(reconstructedLinkArray)
        
        }
        
        Renderer.render(this, 'profile')

        document.addEventListener('linkCreated', e => this.addLink(e.detail))
        
        document.addEventListener('linkDeleted', (e) => this.removeLink(e.detail))

        document.addEventListener('profilePageSaved', (e) => this.updateFields(e))

    } 

    getLink(index) { return this.linkArray[index] }

    addLink(links) { 

        links.forEach( link => {

            const duplicateLinkExists = this.linkArray.some(existingLink => existingLink.linkId === link.linkId)

            if (!duplicateLinkExists) this.linkArray.push(link)

        })

        this.saveProfile()

    } 

    removeLink(link) { 

        Link.validId.unshift(link.linkId)

        this.linkArray = this.linkArray.filter(obj => obj.linkId !== link.linkId)
        
        this.saveProfile()
    
    }
    saveProfile() { 
        
        const localStorage = new LocalStorage('link-app')

        this.linkArray.forEach(link => link.platformData.urlPattern = link.platformData.urlPattern.toString())

        localStorage.setItem('profile', this) 
    
    }

    updateFields(event) {

        this.firstName = event.detail.firstName

        this.lastName = event.detail.lastName

        this.email = event.detail.email

        this.imageString = event.detail.imageString

        this.saveProfile()

    }

}