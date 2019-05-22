// Copyright (c) 2017, Frappé and contributors
// For license information, please see license.txt

var console_dialog = (key) => {
	var dialog = new frappe.ui.Dialog({
		title: 'Console',
		fields: [
			{fieldname: 'console', fieldtype: 'HTML'},
		]
	});
	frappe._output_target = $('<pre class="console"><code></code></pre>')
		.appendTo(dialog.get_field('console').wrapper)
		.find('code')
		.get(0);
	frappe._output = '';
	frappe._in_progress = false;
	frappe._output_target.innerHTML = '';
	dialog.show();
	dialog.$wrapper.find('.modal-dialog').css('width', '800px');
	dialog.$wrapper.find('.console').addClass('bench-console-body');

	frappe.realtime.on(key, function(output) {
		if (output==='\r') {
			// clear current line, means we are showing some kind of progress indicator
			frappe._in_progress = true;
			if(frappe._output_target.innerHTML != frappe._output) {
				// progress updated... redraw
				frappe._output_target.innerHTML = frappe._output;
			}
			frappe._output = frappe._output.split('\n').slice(0, -1).join('\n') + '\n';
			return;
		} else {
			frappe._output += output;
		}

		if (output==='\n') {
			frappe._in_progress = false;
		}

		if (frappe._in_progress) {
			return;
		}

		if (!frappe._last_update) {
			frappe._last_update = setTimeout(() => {
				frappe._last_update = null;
				if(!frappe.in_progress) {
					frappe._output_target.innerHTML = frappe._output;
					let codeHeightPx = dialog.$wrapper.find('code').css('height'),
					consoleHeightPx = dialog.$wrapper.find('.bench-console-body').css('height'),
					scroll = parseInt(codeHeightPx.replace('px', '')) - parseInt(consoleHeightPx.replace('px', ''));
					scroll += 20; // Hack: Add a small abitrary number padding to get to the very end.
					
					if(scroll > 0){
						dialog.$wrapper.find('.bench-console-body').scrollTop(scroll);
					}
				}
			}, 200);
		}
	});
};