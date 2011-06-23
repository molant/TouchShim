//detect if browsers is touch enable


var TOUCH = {
    _dom: { 
        touchstart:[],
        touchend:[],
        touchmove:[],
        touchenter:[],
        touchleave:[],
        touchcancel:[]
    },

    _equals: function (x) {
        for (p in this) {
            if (typeof (x[p]) == 'undefined') { return false; }
        }
        for (p in this) {
            if (this[p]) {
                switch (typeof (this[p])) {
                    case 'object':
                        if (this[p].equals !== undefined && !this[p].equals(x[p])) { return false }
                        else if (this[p] !== x[p]) { return false }; break;
                    case 'function':
                        if (typeof (x[p]) == 'undefined' || (p != 'equals' && this[p].toString() != x[p].toString())) { return false; }; break;
                    default:
                        if (this[p] != x[p]) { return false; }
                }
            }
            else {
                if (x[p]) {
                    return false;
                }
            }
        }

        for (p in x) {
            if (typeof (this[p]) == 'undefined') { return false; }
        }
        return true;
    },

    _touches: [],
    _touchesStart: [],
    _touchesEnd: [],
    _touchesMove: [],
    _touchesEnter: [],
    _touchesLeave: [],
    _touchesCancel: [],

    addEventListener: function (type, element, handler) {
        var domElement, elemHand;
                
        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        domElement = document.getElementById(element);
        if (domElement === undefined) {
            throw 'Element ' + element + ' not in DOM';
        }
        elemHand = {
            domElement: domElement,
            handler: handler,
            equals: this._equals
        };
        if (this._dom[type].indexOf(elemHand) === -1) {
            this._dom[type].push(elemHand);
        }
    },

    removeEventListener: function (type, element, handler) {
        var domElement, elemHand, i;
        domElement = document.getElementById(element);

        if (this._dom[type] === undefined) {
            throw 'Event ' + type + ' is not valid';
        }

        elemHand = {
            domElement: domElement,
            handler: handler,
            equals: this._equals
        };

        for (i = 0; i < this._dom[type].length; i++) {
            if (elemHand.equals(this._dom[type][i])) {
                this._dom[type].splice(i, 1);
                return;
            }
        }

        throw 'Element ' + element + ' does not have the handler you have specified';
    },

    detect: function () {
        try {
            document.createEvent("MozTouchDown");
            return true;
        } catch (e) {
            return false;
        }
    },

    eventFactory: function (type) {
        var constr = type, newevent;
        // error if the constructor doesn't exist
        if (typeof TOUCH[constr] !== "function") {
            throw {
                name: "Error",
                message: constr + " event doesn't exist"
            };
        }
    },

    touchstart: function () {
        var evt;
        evt = document.createEvent('Event', true, true);

    },
    touchend: function () { },
    touchmove: function () { },
    touchcancel: function () { },
    touchenter: function () { },
    touchleave: function () { },
    touchcancel: function () { }
};