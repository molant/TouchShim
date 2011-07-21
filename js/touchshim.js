var log = window.console.log;
var TOUCH = 
{
    _subscribed : false,
    _dom : 
    {
        touchstart : [],
        touchend : [],
        touchmove : [],
        touchenter : [],
        touchleave : [],
        touchcancel : []
    },
    
    _touchInterface : {},
    
    _threshold : 200,
    _previousTimespan : Date.now(),
    
    _equals : function(x){
        var p;
        for(p in this){
            if(this.hasOwnProperty(p)){
                if(typeof(x[p]) === 'undefined'){
                    return false;
                }
            }
        }
        for(p in this){
            if(this.hasOwnProperty(p)){
                if(this[p]){
                    switch(typeof(this[p])){
                        case 'object' : 
                            if(this[p].equals !== undefined && !this[p].equals(x[p])){
                                return false;
                            }
                            else if(this[p] !== x[p]){
                                return false;
                            };
                            break;
                        case 'function' : 
                            if(typeof(x[p]) === 'undefined' || (p !== 'equals' && this[p].toString() !== x[p].toString())){
                                return false;
                            };
                            break;
                        default : 
                            if(this[p] !== x[p]){
                                return false;
                            }
                    }
                }
                else{
                    if(x[p]){
                        return false;
                    }
                }
            }
        }
        
        for(p in x){
            if(x.hasOwnProperty(p)){
                if(typeof(this[p]) === 'undefined'){
                    return false;
                }
            }
        }
        return true;
    },
    
    _touches : [],
    
    _createTouch : function(evt, type, currentTime){
        var touch = 
        {
            identifier : evt.identifier,
            clientX : evt.clientX,
            clientY : evt.clientY,
            screenX : evt.clientX + (window.outerWidth - window.innerWidth) / 2 + window.screenX,
            screenY : evt.clientY + (window.outerHeight - window.innerHeight) + window.screenY,
            //aprox, can't calculate exact value :(
            pageX : evt.clientX + window.pageXOffset,
            pageY : evt.clientY + window.pageYOffset,
            radiusX : 0,
            radiusY : 0,
            rotationAngle : 0,
            force : 0,
            type : type,
            timespan : currentTime
        };
        
        return touch;
    },
    
    _createTouchEvent : function(touches){
        var touchEvent = 
        {
            touches : touches,
            targetTouches : {},
            changedTouches : {},
            altKey : false,
            metaKey : false,
            ctrlKey : false,
            shiftKey : false,
            relatedTarget : {}
        };
        
        return touchEvent;
    },
    
    _onTouchStart : function(x, y, id){
        var i,
        touchstart = TOUCH._dom.touchstart, currentTime = Date.now(), evt = 
        {
            clientX : x,
            clientY : y,
            identifier : id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), touch = TOUCH._createTouch(evt, 'touchstart', currentTime), touchEvent,
        touches = [];
        
        for(i = TOUCH._touches.length - 1; i >= 0; i -- ){
            if((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold){
                if(TOUCH._touches[i].identifier !== touch.identifier){
                    if(TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'cancel'){
                        TOUCH._touches.splice(i, 1);
                    }
                    else if(TOUCH._touches[i].type === 'touchstart'){
                        touches.push(TOUCH._touches[i]);
                    }
                    else if(TOUCH._touches[i].identifier === touch.identifier){
                        TOUCH._touches.splice(i, 1);
                    }
                }
                else{
                    TOUCH._touches.splice(i, 1);
                }
            }
            else{
                TOUCH._touches.splice(i, 1);
            }
        }
        
        TOUCH._touches.push(touch);
        touches.push(touch);
        
        touchEvent = TOUCH._createTouchEvent(touches);
        
        while(element){
            for(i = 0; i < touchstart.length; i ++ ){
                if(touchstart[i].domElement === element){
                    touchstart[i].handler(touchEvent);
                    //do something about bubling here!    
                }
            }
            element = element.parentNode;
        }
    },
    
    _onTouchEnd : function(x, y, id){
        var i,
        touchend = TOUCH._dom.touchend, currentTime = Date.now(), evt = 
        {
            clientX : x,
            clientY : y,
            identifier : id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), touch = TOUCH._createTouch(evt, 'touchend', currentTime), touchEvent,
        touches = [];
        
        for(i = TOUCH._touches.length - 1; i >= 0; i -- ){
            if((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold){
                if(TOUCH._touches[i].type === 'cancel'){
                    TOUCH._touches.splice(i, 1);
                }
                else if(TOUCH._touches[i].type === 'touchend'){
                    touches.push(TOUCH._touches[i]);
                }
            }
            else{
                TOUCH._touches.splice(i, 1);
            }
        }
        
        TOUCH._touches.push(touch);
        touches.push(touch);
        
        touchEvent = TOUCH._createTouchEvent(touches);
        
        while(element){
            for(i = 0; i < touchend.length; i ++ ){
                if(touchend[i].domElement === element){
                    touchend[i].handler(touchEvent);
                    //do something about bubling here!    
                }
            }
            element = element.parentNode;
        }
    },
    _onTouchMove : function(x, y, id){
        var i,
        touchmove = TOUCH._dom.touchmove, currentTime = Date.now(), evt = 
        {
            clientX : x,
            clientY : y,
            identifier : id
        },
        element = document.elementFromPoint(evt.clientX, evt.clientY), touch = TOUCH._createTouch(evt, 'touchmove', currentTime), touchEvent,
        touches = [];
        
        for(i = TOUCH._touches.length - 1; i >= 0; i -- ){
            if(TOUCH._touches[i].identifier === touch.identifier && TOUCH._touches[i].clientX === touch.clientX && TOUCH._touches[i].clientY === touch.clientY){
                //log('exit id:' + touch.identifier);
                //we remove the previous event and add the new one with the updated timespan
                TOUCH._touches.splice(i, 1);
                TOUCH._touches.push(touch);
                return;
            }
            if((currentTime - TOUCH._touches[i].timespan) <= TOUCH._threshold){
                if(TOUCH._touches[i].type === 'touchend' || TOUCH._touches[i].type === 'cancel'){
                    TOUCH._touches.splice(i, 1);
                }
                else if(TOUCH._touches[i].type === 'touchmove'){
                    touches.push(TOUCH._touches[i]);
                }
            }
            else{
                TOUCH._touches.splice(i, 1);
            }
        }
        
        TOUCH._touches.push(touch);
        touches.push(touch);
        
        touchEvent = TOUCH._createTouchEvent(touches);
        
        while(element){
            for(i = 0; i < touchmove.length; i ++ ){
                if(touchmove[i].domElement === element){
                    touchmove[i].handler(touchEvent);
                    //do something about bubling here!    
                }
            }
            element = element.parentNode;
        }
    },
    
    _isEventSupported : function(eventName, element){
        element = element || document.createElement("div");
        eventName = "on" + eventName;
        var isSupported = eventName in element;
        if( ! isSupported){
            if( ! element.setAttribute){
                element = document.createElement("div");
            }
            if(element.setAttribute && element.removeAttribute){
                element.setAttribute(eventName, "");
                isSupported = typeof element[eventName] === "function";
                element.removeAttribute(eventName);
            }
        }
        element = null;
        return isSupported;
    },
    
    /* _getTouchEventMode : function(){
        if(this._isEventSupported('touchstart')){
            return 'iOS';
        }
        else if(this._isEventSupported('moztouchdown')){
            return 'FF';
        }
        else{
            return 'Other';
        }
    },*/
    
    addEventListener : function(type, element, handler){
        var domElement,
        elemHand,
        touch;
        if( ! this._subscribed){
            //            if (Modernizr.touch) {
            //                //how do we detect the browser now?
            //                document.addEventListener('MozTouchDown', this._onTouchStart, false);
            //                document.addEventListener('MozTouchUp', this._onTouchEnd, false);
            //                document.addEventListener('MozTouchMove', this._onTouchMove, false);
            
            //                this._subscribed = true;
            //            } else {
            //                //nothing to do, addeventlistener throws no return values nor exceptions
            //            }
            // Think how to handle other browsers...
            
            try{
                touch = new ActiveXObject("ActiveXTouch.IETouch");
                
                if(touch.IsTouch()){
                    touch.register();
                    
                    touch.addEventListener('touchDown', TOUCH._onTouchStart);
                    touch.addEventListener('touchMove', TOUCH._onTouchMove);
                    touch.addEventListener('touchUp', TOUCH._onTouchEnd);
                    this._subscribed = true;
                    //TODO: update subscribed!
                }
                else{
                    //No touch support. Add event doesn't return errors so just return
                    return;
                }
            }
            catch(exc){
                //No touch support. Add event doesn't return errors so just return
                return;
            }
        }
        
        if(this._dom[type] === undefined){
            throw 'Event ' + type + ' is not valid';
        }
        
        domElement = document.getElementById(element);
        if(domElement === undefined){
            throw 'Element ' + element + ' not in DOM';
        }
        
        elemHand = 
        {
            domElement : domElement,
            handler : handler,
            equals : this._equals
        };
        
        if(this._dom[type].indexOf(elemHand) === -1){
            this._dom[type].push(elemHand);
        }
    },
    
    removeEventListener : function(type, element, handler){
        var domElement,
        elemHand,
        i;
        domElement = document.getElementById(element);
        
        if(this._dom[type] === undefined){
            throw 'Event ' + type + ' is not valid';
        }
        
        elemHand = 
        {
            domElement : domElement,
            handler : handler,
            equals : this._equals
        };
        
        for(i = 0; i < this._dom[type].length; i ++ ){
            if(elemHand.equals(this._dom[type][i])){
                this._dom[type].splice(i, 1);
                return;
            }
        }
        
        throw 'Element ' + element + ' does not have the handler you have specified';
    }
    
    /*dispatchEvent : function(event){},
    detect : function(){
        try{
            document.createEvent("MozTouchDown");
            return true;
        }
        catch(e){
            return false;
        }
    }*/
    
    
    
};