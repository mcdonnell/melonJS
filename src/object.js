/**
 * @license MelonJS Game Engine
 * @copyright (C) 2011 - 2014 Olivier Biot, Jason Oster, Aaron McLeod
 * http://www.melonjs.org
 *
 * melonJS is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

 /**
 * The built in Object Object.
 * @external Object
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object|Object}
 */

if (!Object.defineProperty) {
    /**
     * simple defineProperty function definition (if not supported by the browser)<br>
     * if defineProperty is redefined, internally use __defineGetter__/__defineSetter__ as fallback
     * @param {Object} obj The object on which to define the property.
     * @param {string} prop The name of the property to be defined or modified.
     * @param {Object} desc The descriptor for the property being defined or modified.
     */
    Object.defineProperty = function(obj, prop, desc) {
        // check if Object support __defineGetter function
        if (obj.__defineGetter__) {
            if (desc.get) {
                obj.__defineGetter__(prop, desc.get);
            }
            if (desc.set) {
                obj.__defineSetter__(prop, desc.set);
            }
        } else {
            // we should never reach this point....
            throw "melonJS: Object.defineProperty not supported";
        }
    };
}

/**
 * Can be used to mix modules, to combine abilities
 * @name mixin
 * @memberOf external:Object#
 * @function
 * @param {Object} obj the object you want to throw in the mix
 */
 Object.defineProperty(Object.prototype, "mixin", {
    value: function (obj) {
        var i,
        self = this;

        // iterate over the mixin properties
        for (i in obj) {
            // if the current property belongs to the mixin
            if (obj.hasOwnProperty(i)) {
                // add the property to the mix
                self[i] = obj[i];
            }
        }
        // return the mixed object
        return self;
    },
    enumerable : false,
    configurable : false
});

if (typeof Object.create !== 'function') {
    /**
     * Prototypal Inheritance Create Helper
     * @name create
     * @memberOf external:Object#
     * @function
     * @param {Object} Object
     * @example
     * // declare oldObject
     * oldObject = new Object();
     * // make some crazy stuff with oldObject (adding functions, etc...)
     * ...
     * ...
     *
     * // make newObject inherits from oldObject
     * newObject = Object.create(oldObject);
     */
    Object.create = function(o) {
        var Fn = function() {};
        Fn.prototype = o;
        return new Fn();
    };
}

/**
 * The built in Function Object
 * @external Function
 * @see {@link https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function|Function}
 */

if (!Function.prototype.bind) {
    /** @ignore */
    var Empty = function () {};

    /**
     * Binds this function to the given context by wrapping it in another function and returning the wrapper.<p>
     * Whenever the resulting "bound" function is called, it will call the original ensuring that this is set to context. <p>
     * Also optionally curries arguments for the function.
     * @memberof! external:Function#
     * @alias bind
     * @param {Object} context the object to bind to.
     * @param {} [arguments...] Optional additional arguments to curry for the function.
     * @example
     * // Ensure that our callback is triggered with the right object context (this):
     * myObject.onComplete(this.callback.bind(this));
     */
    Function.prototype.bind = function bind(that) {
        // ECMAScript 5 compliant implementation
        // http://es5.github.com/#x15.3.4.5
        // from https://github.com/kriskowal/es5-shim
        var target = this;
        if (typeof target !== "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var bound = function () {
            if (this instanceof bound) {
                var result = target.apply( this, args.concat(Array.prototype.slice.call(arguments)));
                if (Object(result) === result) {
                    return result;
                }
                return this;
            } else {
                return target.apply(that, args.concat(Array.prototype.slice.call(arguments)));
            }
        };
        if(target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}

/**
 * Sourced from: https://gist.github.com/parasyte/9712366
 * Extend a class prototype with the provided mixin descriptors.
 * Designed as a faster replacement for John Resig's Simple Inheritance.
 * @name extend
 * @memberOf external:Object#
 * @function
 * @param {Object[]} mixins... Each mixin is a dictionary of functions, or a
 * previously extended class whose methods will be applied to the target class
 * prototype.
 * @return {Object}
 * @example
 * var Person = Object.extend({
 *     "init" : function(isDancing) {
 *         this.dancing = isDancing;
 *     },
 *     "dance" : function() {
 *         return this.dancing;
 *     }
 * });
 *
 * var Ninja = Person.extend({
 *     "init" : function() {
 *         // Call the super constructor, passing a single argument
 *         this._super(Person, "init", false);
 *     },
 *     "dance" : function() {
 *         // Call the overridden dance() method
 *         return this._super(Person, "dance");
 *     },
 *     "swingSword" : function() {
 *         return true;
 *     }
 * });
 *
 * var Pirate = Person.extend(Ninja, {
 *     "init" : function() {
 *         // Call the super constructor, passing a single argument
 *         this._super(Person, "init", true);
 *     }
 * });
 *
 * var p = new Person(true);
 * console.log(p.dance()); // => true
 *
 * var n = new Ninja();
 * console.log(n.dance()); // => false
 * console.log(n.swingSword()); // => true
 *
 * var r = new Pirate();
 * console.log(r.dance()); // => true
 * console.log(r.swingSword()); // => true
 *
 * console.log(
 *     p instanceof Person &&
 *     n instanceof Ninja &&
 *     n instanceof Person &&
 *     r instanceof Pirate &&
 *     r instanceof Person
 * ); // => true
 *
 * console.log(r instanceof Ninja); // => false
 */
Object.defineProperty(Object.prototype, "extend", {
    "value" : function () {
        var methods = {};
        var mixins = Array.prototype.slice.call(arguments, 0);

        /**
         * The class constructor which creates the `_super` shortcut method
         * and calls the user `init` constructor if defined.
         * @ignore
         */
        function Class() {
            /**
             * Special method that acts as a proxy to the super class.
             * @name _super
             * @ignore
             */
            this._super = function (superClass, method) {
                return superClass.prototype[method].apply(
                    this,
                    Array.prototype.slice.call(arguments, 2)
                );
            };

            // Call the user constructor
            if (this.init) {
                this.init.apply(this, arguments);
            }
            return this;
        }

        /**
         * Apply methods to the class prototype.
         * @ignore
         */
        function apply_methods(descriptor) {
            Object.keys(descriptor).forEach(function (key) {
                methods[key] = descriptor[key];

                Object.defineProperty(Class.prototype, key, {
                    "configurable" : true,
                    "value" : descriptor[key]
                });
            });
        }

        // Apply superClass
        Class.prototype = Object.create(this.prototype);

        // Apply all mixin methods to the class prototype
        mixins.forEach(function (mixin) {
            apply_methods(mixin.__methods__ || mixin);
        });

        // Apply constructor
        Class.prototype.constructor = Class.prototype.init || Class;

        // Create a hidden property on the class itself to use for mixins
        Object.defineProperty(Class, "__methods__", {
            "value" : methods
        });

        return Class;
    }
});