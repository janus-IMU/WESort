/**
 * WESort
 * User: loizbek
 * Date: 21/11/13
 * minimal team handling
 */


define(function(){
    var Team = Class.extend({
        init: function(eltId, teamIdNameMembers, player, onlineMembers){
            /*example objects : #security
             * {"id":"52801a8ba3c0d51d6af8dd41","name":"guildblum",
             *  "members":[{"5280b70293c139540d000002":"amiram"},
             *            {"5280b70293c139540d000001","jeff"}, etc.]}
             * cf. server/dbHandler.js (getTeam)
             */
            if(typeof teamIdNameMembers !== "undefined"){
                this.id = teamIdNameMembers._id;
                this.name = teamIdNameMembers.name;
                this.members = {};
                for(var i=0; i < teamIdNameMembers.members.length; i++){
                    var self = this;
                    Object.keys(teamIdNameMembers.members[i]).forEach(function (key){
                        self.members[key]=teamIdNameMembers.members[i][key];
                    });
                }
                this.elt = $('#'+eltId);
                this.validate = [];
                if(typeof player !== "undefined"){
                    this.display(player);
                    this.connect(player.getId());
                }
                if(typeof onlineMembers !== "undefined"){
                    for(var i=0; i < onlineMembers.length; i++){
                        this.connect(onlineMembers[i]);
                    }
                }
            }
        },

        isEmpty: function(){
            return (typeof this.id == "undefined");
        },

        getId: function(){
            return this.id;
        },
        getName: function(){
            return this.name;
        },
        getTeamSize: function(){
            return Object.keys(this.members).length;
        },
        getMembersNames: function(){
            var res = [], self = this;
            this.forEachMember(function(key,value){res.push(value);});
            return res;
        },
        forEachMember: function(callback){//callback(key, value)
            var self = this;
            Object.keys(this.members).forEach(function (key) {
                callback(key, self.members[key]);
            });
        },
        getMemberName: function(id){
            if(typeof this.members[id] == "undefined"){
                return false;
            }
            else{
                return this.members[id];
            }
        },

        //gamePlayer is the player who loads the client
        display: function(gamePlayer){
            var self=this, i=1; //0 is for the client player…
            this.forEachMember(function(id, name){
                var colorId;
                if(gamePlayer.getId() == id){
                    self.elt.prepend(Util.print(Patterns.TEAMMEMBER.ELEMENT,
                        [id, name]));
                    colorId = 0;
                }
                else{
                    self.elt.append(Util.print(Patterns.TEAMMEMBER.ELEMENT,
                        [id, name]));
                    colorId = i;
                    //now we take the next in the set of values except 0w
                    i = ((i+1) % (Patterns.TEAMMEMBER.COLORS.length-1))+1;
                }
                $("head style").append(Util.print(Patterns.TEAMMEMBER.STYLE, [id, Patterns.TEAMMEMBER.COLORS[colorId].background, Patterns.TEAMMEMBER.COLORS[colorId].text]));
            });
            this.initEvents(gamePlayer.getId());
        },

        connect: function(playerId){
            console.log("dans connect"+playerId);
            this.elt.find("#p"+playerId).addClass("online");
        },
        disconnect: function(playerId){
            this.elt.find("#p"+playerId).removeClass("online");
        },

        validationRequest: function(playerId){
            console.log(playerId);
            this.validate.push(playerId);
            this.elt.find("#p"+playerId).addClass("validated").attr("title", Util.print(Patterns.VALIDATED, [this.getMemberName(playerId)]));
        },
        cancelValidation: function(playerId){
            var i = this.validate.indexOf(playerId);
            if(i >= 0){
                this.validate.splice(i, 1);
            }
            this.elt.find("#p"+playerId).removeClass("validated").attr("title", Util.print(Patterns.VALIDATE, []));
        },

        validate: function(){
            var res = true;
            for(var i=0; res && (i < this.validate.length); i++){
                res = res && (this.getMemberName(this.validate[i]) !== false);
            }
            return res;
        },

        onSendValidationRequest: function(sendRequest){
            this.sendValidationRequest = sendRequest;
        },

        onSendCancelValidation: function(sendCancel){
            this.sendCancelValidation = sendCancel;
        },

        initEvents: function(playerId){
            var self=this;
            this.elt.find("#p"+playerId+" .validation").click(function(){
                if(! $(this).parent().hasClass("validated")){
                    self.sendValidationRequest();
                }
                else{
                    self.sendCancelValidation();
                }
            }).attr("style","cursor:pointer");
        }

    });

    return Team;
});
