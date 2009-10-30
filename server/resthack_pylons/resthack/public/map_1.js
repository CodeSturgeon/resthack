var make_maze = function(){
    var tab = jQuery('table#placeholder')[0];

    var num_row = document.createElement('tr');
    num_row.appendChild(document.createElement('td'));
    for(lop=0;lop<x_max;lop++){
        var new_cell = document.createElement('th');
        var num = lop.toString(10);
        if(num.length == 1){
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

var clear_tiles = function(tiles){
    var shade_tile = function(x,y){
        var shade_jqo = jQuery('#'+x+'-'+y);
        if(shade_jqo.length == 1){
            var shade_class = shade_jqo.attr('class');
            if(shade_class == 'wall') shade_jqo.attr('class','shade');
        }
    };
    for(tile_no in tiles){
        tile = tiles[tile_no];
        var selector = '#'+tile.x+'-'+tile.y;
        var tile_jqo = jQuery(selector);
        var tile_class = tile_jqo.attr('class');
        if(tile_class != 'clear'){ // Skip any we have already cleared
            tile_jqo.attr('class', 'clear');
            if(tile.shape & 1){ shade_tile(tile.x,tile.y-1); }
            if(tile.shape & 2){ shade_tile(tile.x+1,tile.y); }
            if(tile.shape & 4){ shade_tile(tile.x,tile.y+1); }
            if(tile.shape & 8){ shade_tile(tile.x-1,tile.y); }
        }
    }
};

var paint_mover = function(){
    var movers = new Object();
    return function(x,y,name){
        if(movers[name] != undefined){
            var selector = '#'+movers[name].x+'-'+movers[name].y;
            jQuery(selector).html('');
        }
        var selector = '#'+x+'-'+y;
        jQuery(selector).html(name);
        movers[name] = {x:x,y:y};
    }
}();

var handle_update = function(json){
    clear_tiles(json.tiles);
    paint_mover(json.avatar.x, json.avatar.y, 'X');
    for(other_no in json.others){
        other = json.others[other_no];
        paint_mover(other.x,other.y,'O');
    }
};

var move_element_clicker = function(event){ move_avatar(event.target.value); };

var key_handler = function(event){
    switch(event.keyCode){
        case 38: // Up Arrow
        case 87: // w
        case 73: // i
            move_avatar(1);
            break;
        case 37: // Left Arrow
        case 65: // a
        case 74: //j
            move_avatar(8);
            break;
        case 39: // Right
        case 68: //d
        case 76: //l
            move_avatar(2);
            break;
        case 40: // Down
        case 83: // s
        case 75: //k
            move_avatar(4);
            break;
    }
};

var move_avatar = function(direction){
    jQuery.post(pos_url,{move:direction},handle_update,'json');
};
