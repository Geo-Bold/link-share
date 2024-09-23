/**
 * Class representing a notification.
 */
export class Notify {

    #typeEnum = ['success', 'error', 'information'] // Valid types
    #textContent
    #type
    
    /**
     * Creates a new Notify instance.
     * 
     * @param {string} text - The text content to display in the notification.
     * @param {string} type - The type of notification ('success' or 'error').
     * @throws Will throw an error if the type is not 'success' or 'error'.
     */
    constructor(text, type) {

        try {

            this.#textContent = text

            if (this.#typeEnum.some(validType => validType === type)) {this.#type = type; console.log('working')}

            else throw new Error("Valid type must be 'success' or 'error'.")

            this.#render()

        } catch (error) { console.error(error) }

    }

    /**
     * Renders the notification element and appends it to the document body.
     * Removes any existing notification before adding the new one.
     * Automatically removes the notification from the DOM after 3 seconds.
     * 
     * @private
     */
    #render() {

        const notifyHtml = `
    
            <div class="notify ${this.#type}" id="notify">
                <div class="notify-body">
                    <object data="/projects/link-share/src/assets/images/${this.#type}-svgrepo-com.svg" type="image/svg+xml" width="30"></object>
                    <p>${this.#textContent}</p>
                </div>
            </div>

        `
        
        let existingNotify = document.querySelector('.notify') // Remove any existing notification

        if (existingNotify) document.removeChild(existingNotify)

        const parser = new DOMParser() 

        const notifyEl = parser.parseFromString(notifyHtml, 'text/html').body.firstChild // Parse the HTML string to an actual DOM element

        document.body.append(notifyEl) // Append the new notification to the document body

        notifyEl.scrollIntoView({ behavior: 'smooth', block: 'start' })

        setTimeout(() => notifyEl.remove(), 3000); // Automatically remove the notification after 3 seconds

    }

}