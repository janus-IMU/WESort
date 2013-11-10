/**
 * UglyAuthentication
 * User: loizbek
 * Content: Handling authentication forms
 * Requires: Util
 */

define(function(){
    var UglyAuth = Class.extend({
        init: function(id, dataSource){
            if(typeof dataSource == "string"){
                dataSource = Util.loadJSON(dataSource);
            }
            this.register = dataSource.form.register ;
            this.login = dataSource.form.login ;
            this.classes = dataSource.form.classes;
            this.loadingSrc = dataSource.form.loadingImg;
            this.text = dataSource.form.text;
            this.elt = $("<"+dataSource.form.containerTag+' id="'+id+'">'+dataSource.form.header+'</'+dataSource.form.containerTag+'/>');
            this.form = $("<form id='login-form' action='javascript:void(0);'></form>");
            if(typeof this.classes.form !== "undefined"){
                this.form.addClass(this.classes.form);
            }
            this.form.appendTo(this.elt);
            this.items = {};
            //onSendForm should be called once… see client…
        },

       onSendForm: function(sendFunction){
           this.sendForm = sendFunction;
           var self = this;
           this.form.submit(function(){
               if(self.checkForm()){
                   self.showLoading();
                   self.disableForm();
                   self.sendForm();
               }
           });
       },

        hideForm:function(){
            $('#overlay').removeAttr("class");
        },

        showRegister: function(){
            this.showForm(this.register);
            if (typeof this.register.submit === "undefined"){
                this.register.submit = "<input type='submit' />";
            }
            this.form.append($(this.register.submit).attr("id", 'uglyAuth-'+this.elt.id));
            if(typeof this.text.login !== "undefined"){
                var tmpItem = $("<a>"+this.text.login+"</a>"), self=this;
                tmpItem.click(function(){
                    self.showLogin();
                });
                this.form.append($("<p></p>").append(tmpItem));
            }
            this.type = "register";

        },

        showLogin: function(){
            this.showForm(this.login);
            if (typeof this.login.submit === "undefined"){
                this.login.submit = "<input type='submit' />";
            }
            this.form.append($(this.login.submit).attr("id",'uglyAuth-'+this.elt.id));
            if(typeof this.text.register !== "undefined"){
                var self=this, tmpItem = $("<a>"+this.text.register+"</a>");
                tmpItem.click(function(){
                    self.showRegister();
                });
                this.form.append($("<p></p>").append(tmpItem));
            }
            this.type = "login";
        },

        getFormType: function(){
            if(typeof this.type !== undefined){
                return this.type;
            }
            else{
                return false;
            }
        },

        showForm: function(aForm){
            this.destroyElts();
            for(var i=0; i<aForm.length;i++){
                this.writeItem(aForm[i]);
            }

            $('#overlay').attr("class", "show").append(this.elt);
        },

        writeItem: function(item){
            this.items[item.id] = {type: item.type, optional: item.optional};
            this.form.append("<p></p>");
            this.form.children().last().append("<label>"+ item.text +"</label>");
            var self = this;
            switch(item.type){
                case "text":
                case "e-mail":
                    this.items[item.id].elt = $("<input type='text' id='"+ item.id +"' />");
                    this.form.children().last().append(this.items[item.id].elt);
                    this.items[item.id].elt.blur(function(){
                        self.checkField(item.id);
                    });
                    break;
                case "password":
                    this.items[item.id].elt = $("<input type='password' id='"+ item.id +"' />");
                    this.form.children().last().append(this.items[item.id].elt);
                    this.items[item.id].elt.blur(function(){
                        self.checkField(item.id);
                    });
                    if(typeof item.textVerification == "string"){
                        this.form.append("<p></p>");
                        this.items[item.id].elt2 = $("<input type='password' id='"+ item.id +"2' />");
                        this.form.children().last().append("<label>"+ item.textVerification +"</label>");
                        this.form.children().last().append(this.items[item.id].elt2);
                        this.items[item.id].elt2.blur(function(){
                            if($(this).val()==""){
                                if(!self.items[item.id].optional){
                                    self.fieldError($(this), self.text.errorEmpty);
                                }
                            }
                            else{
                                self.checkField(item.id);
                            }
                        });
                    }
                    break;
                case "image":
                    var tmpElt;
                    this.items[item.id].elt = $("<fieldset id='"+ item.id +"' value=''/></fieldset>");
                    this.form.children().last().append(this.items[item.id].elt);
                    var imageId;
                    for(var i=0; i<item.images.length;i++){
                        imageId = item.images[i].id;
                        tmpElt = $('<button type="button" id="'+item.images[i].id+'"></button>');
                        tmpElt.append('<img src="'+item.images[i].file+'" />');
                        this.items[item.id].elt.append(tmpElt);
                        tmpElt.click(function(){
                            $("#"+item.id+" button").removeClass(self.classes.selected);
                            $(this).addClass(self.classes.selected);
                            $(this).parent().attr("value", this.id);
                            self.fieldOK(self.items[item.id].elt);
                        });
                        tmpElt.blur(function(){
                            console.log($(":focus").attr("id"));
                            setTimeout(function(){
                                if(document.activeElement.parentNode.id !== item.id){
                                    self.checkField(item.id);
                                }
                            }, 10);
                        });
                    }
                    $("<div></div>").css("clear","both").css("padding-bottom","6px").appendTo(this.form);//dummy element for the next one…
            }

        },

        clearForm: function(){
            var self=this;
            Object.keys(this.items).forEach(function (key) {
                self.items[key].elt.val("");
                self.items[key].elt.attr("class","");
                if(typeof self.items[key].elt2 !== "undefined"){
                    self.items[key].elt2.val("");
                    self.items[key].elt2.attr("class","");
                    self.items[key].elt2.siblings("."+self.classes.error).remove();
                }
                self.items[key].elt.siblings("."+self.classes.error).remove();
            });
        },

        destroyElts: function(){
            this.items = {};
            if(typeof this.form !== "undefined"){
                this.form.children().remove();
            }
        },

        fieldOK: function(elt){
            elt.siblings("."+this.classes.error).remove();
            elt.removeClass(this.classes.error);
            elt.addClass(this.classes.ok);
        },

        fieldError: function(elt, msg){
            elt.siblings("."+this.classes.error).remove();
            elt.removeClass(this.classes.ok);
            elt.addClass(this.classes.error);
            if(typeof msg !== "undefined"){
                elt.after("<span class='"+this.classes.error+"'>"+msg+"</span>");
            }
        },

        checkField: function(id){
            var res = false;
            if(this.items[id].elt.val()==""){
                if(!this.items[id].optional){
                    this.fieldError(this.items[id].elt, this.text.errorEmpty);
                }
            }
            else{
                switch(this.items[id].type){
                    case "e-mail":
                        if (Util.isEmail(this.items[id].elt.val())){
                            this.fieldOK(this.items[id].elt);
                            res = true;
                        }
                        else{
                            this.fieldError(this.items[id].elt, this.text.errorEmail);
                        }
                        break;
                    case "password":
                        if( (typeof this.items[id].elt2 !== "undefined") &&
                            (this.items[id].elt2.val() !== "") ){//too bad if the user starts with the second
                            if(this.items[id].elt.val() != this.items[id].elt2.val()){
                                this.fieldError(this.items[id].elt);
                                this.fieldError(this.items[id].elt2, this.text.errorPsswd);
                            }
                            else{
                                this.fieldOK(this.items[id].elt);
                                this.fieldOK(this.items[id].elt2);
                                res = true;
                            }
                        }
                        else if(this.items[id].elt.val() != ""){
                            this.fieldOK(this.items[id].elt);
                            res = true;
                        }
                        break;
                    case "image":
                    default:
                        this.fieldOK(this.items[id].elt);
                        res=true;
                }
            }
            return res;
        },//end checkField

        checkForm: function(){
            var self=this, result = true;
            Object.keys(this.items).forEach(function (key) {
                result = self.checkField(key) && result;
            });
            return result;
        },

        fieldsToUrl: function(){
            var res = this.getFormType();
            if(res !== false){
                res="?action="+res;
                var self=this;
                Object.keys(this.items).forEach(function (key) {

                    res += "&" + key + "=" +encodeURIComponent(self.items[key].elt.val());
                });
            }
            return res;
        },

        showLoading: function(){

            $("#uglyAuth-"+this.elt.id).after('<img src="'+this.loadingSrc+'" />');
        },

        disableForm: function(){
            var self=this;
            Object.keys(this.items).forEach(function (key) {
                self.items[key].elt.attr("disabled", "disabled").removeAttr("class");
                if(typeof self.items[key].elt2 !== "undefined"){//checked password
                    self.items[key].elt2.attr("disabled", "disabled").removeAttr("class");
                }
                //images
                if(self.items[key].type == "image"){
                    self.items[key].elt.removeAttr("class");
                    $("#"+key+" button").attr("disabled", "disabled");
                }

            });
            this.form.attr("disabled", "disabled");
        }
    });
    return UglyAuth;
});