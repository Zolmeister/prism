// events
(function(){var d={},c=0,a,b;this.Events={on:function(a,c,b){d[a]=d[a]||[];d[a].push({f:c,c:b})},off:function(b,e){a=d[b]||[];if(!e)return a.length=0;for(c=a.length;0<=--c;)e==a[c].f&&a.splice(c,1)},emit:function(){b=Array.apply([],arguments);a=d[b.shift()]||[];b=b[0]instanceof Array&&b[0]||b;for(c=a.length;0<=--c;)a[c].f.apply(a[c].c,b)}}})()
