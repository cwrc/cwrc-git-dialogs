'use strict';

var prevJQuery = window.jQuery;
var $ = require('jquery');
window.jQuery = $;
require('bootstrap');
window.jQuery = prevJQuery;

var Cookies = require('js-cookie');

function authenticate() {

	if (Cookies.get('cwrc-token')) {
		return true
	} else {

		$(document.body).append($.parseHTML(
			`<div id="githubAuthenticateModal" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div id="menu" class="modal-body">
                            <div style="margin-bottom:2em">
                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true" style="float:right"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button>
                                <h4 id="gh-modal-title' class="modal-title" style="text-align:center">Authenticate with Github</h4>
                            </div>
                            <div style="margin-top:1em">
                                <div id="cwrc-message" style="margin-top:1em">
                                    You must first authenticate through Github to allow the CWRC-Writer 
                                    to make calls on your behalf.  CWRC does not keep any of your github 
                                    information.  The github token issued by github is not stored on a 
                                    CWRC-Server, but is only submitted as a jwt token for each request 
                                    you make.  If you are looking for a version of the CWRC-Writer that 
                                    does not use Github to store documents, please try our other sandbox:  
                                    <a href="http://apps.testing.cwrc.ca/editor/dev/editor_dev.htm">
                                        CWRC-Writer Simple Sandbox
                                    </a>
                                </div>
                            </div>
                            <div style="text-align:center;margin-top:3em;margin-bottom:3em" id="git-oath-btn-grp">
                                <div class="input-group" >
                                    <div class="input-group-btn" >
                                        <button type="button" id="git-oauth-btn" class="btn btn-default">Authenticate with Github</button>
                                    </div>
                                </div> <!--input group -->
                            </div>
                        </div><!-- /.modal-body --> 
                    </div><!-- /.modal-content -->
                </div><!-- /.modal-dialog -->
            </div><!-- /.modal -->`
		));

		$('#git-oauth-btn').click(function(event){
			window.location.href = "/github/authenticate";
		});

		$('#githubAuthenticateModal').modal('show').on('shown.bs.modal', function () {
			$(".modal").css('display', 'block');
		}).on('hidden.bs.modal', function() {
			$(this).remove()
		})

		return false
	}

}

export default authenticate
