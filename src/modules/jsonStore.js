"use strict";

const fs = require("node:fs");
const log = require("./logger");

/**
 * Operates a local JSON store
 *
 * @class Store
 */
class Store {
    /**
     * Creates an instance of Store.
     *
     * @param {String} path - Path to the JSON file.
     * @public
     * @memberof Store
     */
    constructor(path){
        this._path = path;
        if (fs.existsSync(path)){
            this._store = JSON.parse(fs.readFileSync(path, "utf8"));
        }
        else {
            log.warn(`Store file ${path} does not exist. Creating new file.`);
            this._store = {};
            this.#save();
        }
    }

    /**
     * Deep clone of a POJO
     *
     * @param {String | JSON | Object} data
     * @returns {Promise<undefined | Object>}
     * @ignore
     * @memberof Store
     */
    #clone(data){
        return data === undefined
            ? undefined
            : JSON.parse(JSON.stringify(data));
    }

    /**
     * Save to file
     *
     * @ignore
     * @memberof Store
     */
    async #save(){
        await fs.promises.writeFile(this._path, JSON.stringify(this._store), "utf8");
    }

    /**
     * Retrieve a value from the store
     *
     * @param {String} key
     * @returns {Promise<any>}
     * @public
     * @memberof Store
     */
    async get(key){
        return this.#clone(key ? this._store?.[key] : this._store);
    }

    /**
     * Set a value in the store
     *
     * @param {String} key
     * @param {any} value
     * @public
     * @memberof Store
     */
    async set(key, value){
        this._store[key] = this.#clone(value);
        await this.#save();
    }

    /**
     * Remove a value from the store
     *
     * @param {String} key
     * @public
     * @memberof Store
     */
    async del(key){
        delete this._store?.[key];
        await this.#save();
    }
}

module.exports = Store;
