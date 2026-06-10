function n(r){return r==null?"N/A":new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(r).replace(/[\u00A0\u202F]/g," ")}export{n as f};
