var make_maze = function(){
    var tab = jQuery('table#placeholder')[0];

    var num_row = document.createElement('tr');
    num_row.appendChild(document.createElement('td'));
    for(lop=0;lop<x_max;lop++){
        var new_cell = document.createElement('th');
        var num = lop.toString(10);
        if(num.length == 1){
            new_cell.appendChild(document.createTextNode(' '));
            new_cell.appendChild(document.createElement('br'));
            new_cell.appendChild(document.createTextNode((lop+'')[0]));
        } else {
            new_cell.appendChild(document.createTextNode(num[0]));
            new_cell.appendChild(document.createElement('br'));
            new_cell.appendChild(document.createTextNode(num[1]));
        }
        num_row.appendChild(new_cell);
    }
    num_row.appendChild(document.createElement('td'));
    
    // Head row
    tab.appendChild(num_row);

    for(lop=0;lop<y_max;lop++){
        var body_row = document.createElement('tr');
        var num_cell = document.createElement('th');
        num_cell.appendChild(document.createTextNode(lop.toString(10)));
        body_row.appendChild(num_cell);
        for(lop2=0;lop2<x_max;lop2++){
            var new_cell = document.createElement('td');
            new_cell.className = 'wall';
            new_cell.id = lop2+'-'+lop;
            new_cell.appendChild(document.createTextNode(' '));
            body_row.appendChild(new_cell);
        }
        body_row.appendChild(num_cell.cloneNode(true));
        tab.appendChild(body_row);
    }

    // Foot row
    tab.appendChild(num_row.cloneNode(true));
}
