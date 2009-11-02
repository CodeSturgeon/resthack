var make_maze = function(width, height, indexes){
    var tab = jQuery('table#placeholder')[0];

    var num_row = document.createElement('tr');
    num_row.appendChild(document.createElement('td'));
    for(lop=0;lop<width;lop++){
        var new_cell = document.createElement('th');
        var num = lop.toString(10);
        if(num.length == 1){
            new_cell.appendChild(document.createTextNode((lop+'')[0]));
        } else {
            new_cell.className = 'ddiget';
            new_cell.appendChild(document.createTextNode(num[0]));
            new_cell.appendChild(document.createElement('br'));
            new_cell.appendChild(document.createTextNode(num[1]));
        }
        num_row.appendChild(new_cell);
    }
    num_row.appendChild(document.createElement('td'));
    
    if(indexes){
    // Head row
        tab.appendChild(num_row);
    }

    for(lop=0;lop<height;lop++){
        var body_row = document.createElement('tr');
        if(indexes){
            var num_cell = document.createElement('th');
            num_cell.appendChild(document.createTextNode(lop.toString(10)));
            body_row.appendChild(num_cell);
        }
        for(lop2=0;lop2<width;lop2++){
            var new_cell = document.createElement('td');
            new_cell.className = 'wall';
            new_cell.id = lop2+'-'+lop;
            new_cell.appendChild(document.createTextNode(' '));
            body_row.appendChild(new_cell);
        }
        if(indexes){
            body_row.appendChild(num_cell.cloneNode(true));
        }
        tab.appendChild(body_row);
    }

    // Foot row
    if(indexes){
        tab.appendChild(num_row.cloneNode(true));
    }
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

var paint_movers = function(json,cls){
    if(json.avatar){
        if(!cls){cls='avatar'};
        var selector = '#'+json.avatar.x+'-'+json.avatar.y;
        jQuery(selector).attr('class',cls);
    }
    if(json.others){
        if(cls=='avatar'){cls='other'};
        for(other_no in json.others){
            var other = json.others[other_no];
            var selector = '#'+other.x+'-'+other.y;
            jQuery(selector).attr('class',cls);
        }
    }
};

var handle_update = function(){
    var last_run = new Object();
    return function(json){
        clear_tiles(json.tiles);

        paint_movers(last_run,'clear');
        paint_movers(json);
        last_run = json;
    }
}();

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
