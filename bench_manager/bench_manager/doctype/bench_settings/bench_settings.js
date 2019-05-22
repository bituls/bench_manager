// Copyright (c) 2017, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bench Settings', {
	onload: function(frm) {
		if (frm.doc.__islocal != 1) frm.save();
		let site_config_fields = ["background_workers", "shallow_clone", "admin_password",
			"auto_email_id", "auto_update", "frappe_user", "global_help_setup",
			"dropbox_access_key", "dropbox_secret_key", "gunicorn_workers", "github_username",
			"github_password", "mail_login", "mail_password", "mail_port", "mail_server",
			"use_tls", "rebase_on_pull", "redis_cache", "redis_queue", "redis_socketio",
			"restart_supervisor_on_update", "root_password", "serve_default_site",
			"socketio_port", "update_bench_on_update", "webserver_port", "developer_mode",
			"file_watcher_port"];
		site_config_fields.forEach(function(val){
			frm.toggle_display(val, frm.doc[val] != undefined);
		});
	},
	refresh: function(frm) {
		frm.add_custom_button(__("Get App"), function(){
			var dialog = new frappe.ui.Dialog({
				title: 'App Name',
				fields: [
					{fieldname: 'app_name', fieldtype: 'Data', reqd:true, label: 'Name of the app or url to the source git repo'},
					{fieldname: 'extra_params', fieldtype: 'Data', reqd:false
						, label: 'Optional parameters to pass to get-app. See bench get-app --help'}
				]
			});
			dialog.set_primary_action(__("Get App"), () => {
				let key = frappe.datetime.get_datetime_as_string();
				console_dialog(key);
				frm.call("console_command", {
					key: key,
					caller: 'get-app',
					app_name: dialog.fields_dict.app_name.value,
					extra_params: dialog.fields_dict.extra_params.value
				}, () => {
					dialog.hide();
				});
			});
			dialog.show();
		});
		frm.add_custom_button(__('New Site'), function(){
			frappe.call({
				method: 'bench_manager.bench_manager.doctype.site.site.pass_exists',
				args: {
					doctype: frm.doctype
				},
				btn: this,
				callback: function(r){
					var dialog = new frappe.ui.Dialog({
						fields: [
							{fieldname: 'site_name', fieldtype: 'Data', label: "Site Name", reqd: true},
							{fieldname: 'install_erpnext', fieldtype: 'Check', label: "Install ERPNext"},
							{fieldname: 'admin_password', fieldtype: 'Password',
								label: 'Administrator Password', reqd: r['message']['condition'][0] != 'T',
								default: (r['message']['admin_password'] ? r['message']['admin_password'] :'admin'),
								depends_on: `eval:${String(r['message']['condition'][0] != 'T')}`},
							{fieldname: 'mysql_password', fieldtype: 'Password',
								label: 'MySQL Password', reqd: r['message']['condition'][1] != 'T',
								default: r['message']['root_password'], depends_on: `eval:${String(r['message']['condition'][1] != 'T')}`},
							{fieldname: 'extra_params', fieldtype: 'Data', reqd:false
								, label: 'Optionsl additional parameters to pass to new-site. See bench new-site --help'}
						],
					});
					dialog.set_primary_action(__("Create"), () => {
						let key = frappe.datetime.get_datetime_as_string();
						let install_erpnext;
						if (dialog.fields_dict.install_erpnext.last_value != 1){
							install_erpnext = "false";
						} else {
							install_erpnext = "true";
						}
						frappe.call({
							method: 'bench_manager.bench_manager.doctype.site.site.verify_password',
							args: {
								site_name: dialog.fields_dict.site_name.value,
								mysql_password: dialog.fields_dict.mysql_password.value
							},
							callback: function(r){
								if (r.message == "console"){
									console_dialog(key);
									frappe.call({
										method: 'bench_manager.bench_manager.doctype.site.site.create_site',
										args: {
											site_name: dialog.fields_dict.site_name.value,
											admin_password: dialog.fields_dict.admin_password.value,
											mysql_password: dialog.fields_dict.mysql_password.value,
											install_erpnext: install_erpnext,
											key: key,
											extra_params: dialog.fields_dict.extra_params.value
										}
									});
									dialog.hide();
								} 
							}
						});
					});
					dialog.show();
				}
			});
		});
		frm.add_custom_button(__("Update"), function(){
			var dialog = new frappe.ui.Dialog({
				title: 'Update',
				fields: [
					{fieldname: 'extra_params', fieldtype: 'Data', reqd:false
						, label: 'Optional parameters to pass to update. See bench update --help'}
				]
			});
			dialog.set_primary_action(__("Update"), () => {
				let key = frappe.datetime.get_datetime_as_string();
				console_dialog(key);
				frm.call("console_command", {
					key: key,
					caller: 'bench_update',
					extra_params: dialog.fields_dict.extra_params.value
				}, () => {
					dialog.hide();
				});
			});
			dialog.show();
		});
		frm.add_custom_button(__('Sync'), () => {
			frappe.call({
				method: 'bench_manager.bench_manager.doctype.bench_settings.bench_settings.sync_all'
			});
		});
		frm.add_custom_button(__("Bench Command"), function(){
			var dialog = new frappe.ui.Dialog({
				title: 'Bench Command',
				fields: [
					{fieldname: 'bench_params', fieldtype: 'Data', reqd:true
						, label: 'Command and parameters to bench. See bench --help. (Try putting --help in the input below)'}
				]
			});
			dialog.set_primary_action(__("Run"), () => {
				let key = frappe.datetime.get_datetime_as_string();
				console_dialog(key);
				frm.call("console_command", {
					key: key,
					caller: 'bench',
					extra_params: dialog.fields_dict.bench_params.value
				}, () => {
					dialog.hide();
				});
			});
			dialog.show();
		});
	}
});