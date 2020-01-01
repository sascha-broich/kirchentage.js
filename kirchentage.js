const myDays = new Array();

function openTab(element) {
    let sections=document.getElementsByTagName("section");
    for(let i=0;i<sections.length;i++) {
        sections[i].classList.remove("active");
    }
    let tabs=document.getElementById("tabs").children;
    for(let i=0;i<tabs.length;i++) {
        tabs[i].classList.remove("active");
    }
    document.getElementById(element.id.substring(4)).classList.add("active");
    element.classList.add("active");
}

function toggle(element) {
    if(element.value==0) {
        element.value=1;
        element.firstChild.nodeValue="Julianisch";
    }
    else {
        element.value=0;
        element.firstChild.nodeValue="Gregorianisch";
    }
    return true;
}

function setDaysOfMonth() {
    let year=parseInt(document.getElementById("wochentage-jahr").value,10);
    let month=document.getElementById("wochentage-monat").selectedIndex;
    let julian=document.getElementById("wochentage-toggle").value;
    let buttons=document.getElementById("wochentage-kalender").getElementsByTagName("button");

    let date=new Date(year,month,1);
    let dow=date.getDay();
    dow=(6+dow)%7;
    date.setFullYear(year,month+1,0);
    let last=date.getDate()+dow;

    for(let i=0;i<buttons.length;i++) 
        buttons[i].innerHTML=(i>=dow && i<last)?(""+(i+1-dow)):"";
}

window.onload=function () {
    setDaysOfMonth();
    loadChurchDays();
}

Calendar = class {
    YEAR = 1;
    MONTH = 2;
    WEEK_OF_YEAR = 3;
    WEEK_OF_MONTH = 4;
    DATE = 5;
    DAY_OF_MONTH = 5;
    DAY_OF_YEAR = 6;
    DAY_OF_WEEK = 7;

    SUNDAY = 7;
}

GregorianCalendar = class extends Calendar {
    julianDay;
    julian=false;
    firstGregorianDay=2299159.5;

    constructor(year, month, day, julian=false) {
        this.setJulian(julian);
        this.set(year,month,day);
    }

    setJulian(julian) {
        this.julian=julian;
    }

    set(year,month,day) {
        let switchDate=this.calc(this.firstGregorianDay);
        if(this.julian || (year < switchDate.year) || (month < switchDate.month) || day < switchDate.day) {
            // https://en.wikipedia.org/wiki/Julian_day#Converting_Julian_calendar_date_to_Julian_Day_Number
            this.julianDay = 367 * year - (7 * (year + 5001 + (month - 9)/7))/4 + (275 * month)/9 + day + 1729777;
        } 
        else {
            // https://en.wikipedia.org/wiki/Julian_day#Converting_Gregorian_calendar_date_to_Julian_Day_Number
            // JDN = (1461 * (Y + 4800 + (M - 14)/12))/4 +(367 * (M - 2 - 12 * ((M - 14)/12)))/12 - (3 * ((Y + 4900 + (M - 14)/12)/100))/4 + D - 32075
            this.julianDay = (1461 * (year + 4800 + (month - 14)/12))/4 +(367 * (month - 2 - 12 * ((month - 14)/12)))/12 - (3 * ((year + 4900 + (month - 14)/12)/100))/4 + day - 32075;
        }
    }

    setFirstGregorianDay(year,month,day) {
        this.firstGregorianDay = (1461 * (year + 4800 + (month - 14)/12))/4 +(367 * (month - 2 - 12 * ((month - 14)/12)))/12 - (3 * ((year + 4900 + (month - 14)/12)/100))/4 + day - 32075;
    }

    calc(J=this.julianDay) {
        let y=4716;
        let v=3;
        let j=1401;
        let u=5;
        let m=2;
        let s=153;
        let n=12;
        let w=2;
        let r=4;
        let B=274277;
        let p=1461;
        let C=-38;

        if(this.julian || J < this.firstGregorianDay) {
            let f = J + j;
        } 
        else {
            let f = J + j + (((4 * J + B) / 146097) * 3) / 4 + C;
        }
        let e = r * f + v;
        let g = (e % p) / r;
        let h = u * g + w;
        let D = ((h % s)) / u + 1;
        let M = ((h / s + m) % n) + 1;
        let Y = (e / p) - y + (n + m - M) / n;
        return {year:Y,month:M,day:D};
    }
    
    get(field, value) {
        if(field == Calendar.DAY_OF_WEEK) {
            return (this.julianDay % 7)+1;
        }
        else if(field == Calendar.YEAR) {
            return this.calc().year;
        }
        else if(field == Calendar.MONTH) {
            return this.calc().month;
        }
        else if(field == Calendar.DAY_OF_MONTH) {
            return this.calc().day;
        }
        else {
            console.log("unerwartet: GregorianCalendar.get("+field+","+value+")");
        }
    }

    add(field, value ) {
        if(field == Calendar.DAY_OF_YEAR || field == Calendar.DAY_OF_MONTH) {
            this.julianDay+=value;
        } 
        else {
            while(value-- > 0 ) {
                addInternal(field,1);
            }
            while(value++ < 0) {
                addInternal(field, -1);
            }
        }
    }

    addInternal(field, value) {
        //TODO: Check, ob die Berechnung korrekt funktioniert
        let date=this.calc();
        if(field == Calendar.YEAR) {
            this.set(date.year+value,date.month,date.day);
        } 
        else if(field == Calendar.MONTH) {
            this.set(date.year,date.month+value,date.day);
        }
    }
};

Day = class {
	myReference; // Day
	myWeekOffset; //int 
	myDayOfWeek; //int 
	myDayOfMonth; // int
	myMonth; //int
	myOffset; //int
	
	myAbsolute=false; //boolean
	myRelative=false; //boolean
	
	constructor (dayOfWeek, week, reference, offset, dayOfMonth, month) {
        if(dayOfWeek) {
            this.myReference=reference;
            this.myDayOfWeek=dayOfWeek;
            this.myWeekOffset=week;
            this.myRelative=true;
        }
        else if(offset) {
            this.myReference=reference;
            this.myOffset=offset;
        }
        else if(dayOfMonth) {
            this.myReference=null;
            this.myDayOfMonth=dayOfMonth;
            this.myMonth=month-1; // Umrechnung für Calendar
            this.myAbsolute=true;
        }
	}

	getOffset = function (calendar) {
		if(this.myAbsolute) { // Sollte nicht vorkommen
			return 0;
		}
		else if(this.myRelative) { // Wochentag 
			let refDayOfWeek=(this.myReference==null)?0:this.myReference.getDayOfWeek(calendar);
			let dd=this.myDayOfWeek-refDayOfWeek;
			let week=this.myWeekOffset;
			
			if(dd<0 && week <0) week++;
			else if(dd>0 && week>0) week--;

			return (7*week)+dd;
		}
		else { // Einfach mit Offset
			return this.myOffset;
		}	
	}	

	getJulianDate = function(year) {
		return this.getDate(year,true);
	}

	getGregorianDate = function(year) {
		return this.getDate(year,false);
	}
	
	getDate = function(year, julian) {
		if(this.myReference==null) {
			let calendar=getCalendar(julian);
			calendar.set(year,this.myMonth,this.myDayOfMonth);
			return calendar;
		}
		else {
			return this.getDate(this.myReference.getDate(year,julian));
		}		
	}

	getDate = function(cal) {
		cal.add(Calendar.DAY_OF_YEAR,getOffset(cal));		
		return cal;
	}
	
	getDayOfWeek = function(calendar) {
		if(this.myRelative) { // Wochentag schon vorhanden
			return this.myDayOfWeek;
		}
		else if(this.myAbsolute) {
			let cal=calendar.clone();
			cal.set(calendar.get(Calendar.YEAR),this.myMonth,this.myDayOfMonth);
			let dow=cal.get(Calendar.DAY_OF_WEEK)-1;// Einen Tag abziehen
			if(dow==0) dow=7;//Sonntag
			return dow;
		} else { // Sollte nicht vorkommen
			return 0;
		}
	}
	
	getCalendar = function(julian) {
		let calendar=new GregorianCalendar();
		if(julian) calendar.setGregorianChange(new Date(Long.MAX_VALUE));
		return calendar;
	}
}

ChurchDay = class extends Day {
	myName; // String
	
	constructor(name, dayOfWeek, week, reference, dayOfMonth, month) {
		super(dayOfWeek,week,reference,null,dayOfMonth,month);
		this.myName=name;
	}

    toString = function() {
		return this.getName();
	}
	
	getName  = function() {
		return this.myName;
	}
}

Advent = class extends ChurchDay {
	constructor() {
		super("1. Advent",7,0,null);
	}

	getDate = function(year, julian) {
		let calendar=getCalendar(julian);
		calendar.set(year,11,25);		// 1. Weihnachtstag
        calendar.add(Calendar.DAY_OF_YEAR,-4*7); // 4 Wochen zurück
        while (calendar.get(Calendar.DAY_OF_WEEK)!= Calendar.SUNDAY)
            calendar.add(Calendar.DAY_OF_YEAR, -1); // zurückgehen, bis Sonntag ist
		return calendar;
	}
}

Easter = class extends ChurchDay {
	constructor() {
		super("Ostern", 7,0, null);
	}

	getDate = function (year, julian) {
		let g=year%19;
		let i,j;
		
		if(julian) {
			i=(19*g+15)%30;
			j=(year+(year/4)+i)%7;
		}
		else {
			let c=year/100;
			let h=(c-(c/4)-(((8*c)+13)/25)+(19*g)+15)%30;
			i=h-((h/28)*(1-(29/(h+1)))*((21-g)/11));
			j=(year+(year/4)+i+2-c+(c/4))%7;
		}
		
		let m=i-j;
		let month=3+((m+40)/44);
		let day=m+28-(31*(month/4));

		let cal=this.getCalendar(julian);
		cal.set(year,month-1,day);
		return cal;
	}
}

MonthDay = class extends ChurchDay {
	constructor(offset,dayOfWeek,month, name) {
		super(name, null, null, null, 0, month);
		this.myDayOfWeek=dayOfWeek;
		this.myOffset=offset>0?offset-1:offset;
		this.myAbsolute=false;
		this.myRelative=true;
	}

	getDate = function(year, julian) {		
		let calendar=this.getCalendar(julian);
		calendar.set(year,this.myMonth,1);

		// Wenn von hinten gezählt wird
		if(this.myOffset<0) calendar.add(Calendar.MONTH, 1);

		let dow=calendar.get(Calendar.DAY_OF_WEEK);
		
		let days=(this.myOffset*7)+(this.myDayOfWeek-dow);
		calendar.add(Calendar.DAY_OF_MONTH, days);

		return calendar;
	}
}


loadChurchDays = function()
{
	const WEEK_DAYS	= ["Tag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
	const PRE_POST	= ["vor", "genau", "nach"];

    const easter = new Easter();
    const advent = new Advent();

    myDays.push(easter);
    myDays.push(advent);

    try
    {
        let request=new XMLHttpRequest();
        request.open("GET",self.location.href.substring(0,self.location.href.lastIndexOf("/")+1) + "kirchentage.txt",true);
        request.send();
        request.onload=function(){
            let lines=request.responseText.split(/\r?\n/);
            lines.forEach(line => {
                let split = line.split("\t");
                for (let i = 0; i < split.length; i++) {
                    split[i] = split[i].trim();
                }					
                if (split.length >= 2 && split[0].indexOf(".") >0) {
                    // Datum lesen: dd.MM.
                    let date = split[0].split(".");
                    let dayOfMonth = parseInt(date[0]);
                    let month = parseInt(date[1]);
                    let name = "";
                    for(let i=1;i<split.length;i++) {
                        if(i>1) name+=" ";
                        name+=split[i];
                    }
                    myDays.push(new ChurchDay(name, null, null, null, dayOfMonth, month));
                }
                else
                {
                    let name = "";
                    let week = 0;
                    let dow = 7;
                    let ref = easter;
                    let month=-1;

                    let len = -1;
                    // Offset
                    if (split.length > ++len) {
                        week = parseInt(split[len]);
                    }
                    // Wochentag
                    if (split.length > ++len) {
                        for (let i = 1; i < WEEK_DAYS.length; i++) {
                            if (WEEK_DAYS[i].toLowerCase().startsWith(split[len].toLowerCase())) {
                                dow = i;
                                break;
                            }
                        }
                    }
                    // Referenz-Tag
                    if (split.length > ++len) {
                        // Auf Monat prüfen
                        if(new RegExp("^\\d+$").test(split[len])) {
                            month=parseInt(split[len]);								
                        }
                        else if (easter.getName().toLowerCase().startsWith(split[len].toLowerCase())) {
                            ref = easter;
                        }
                        else if (advent.getName().toLowerCase().startsWith(split[len].toLowerCase())) {
                            ref = advent;
                        }
                        else if("advent".startsWith(split[len].toLowerCase())) {
                            ref = advent;
                        }
                    }
                    // Name
                    while (split.length > ++len) {
                        if(name.length>0) name+=" ";
                        name+=split[len];
                    }

                    if (name.length > 0) {
                        if(month>0) myDays.push(new MonthDay(week,dow,month,name.toString()));							
                        else myDays.push(new ChurchDay(name.toString(), dow, week, ref));
                    }
                }

                myDays.sort(function(o1, o2) {
                    return o1.getName().localeCompare(o2.getName());
                });
            
                let kirchentagTag = document.getElementById("kirchentag-tag");
                while(kirchentagTag.firstChild)
                    kirchentagTag.firstChild.remove();
                myDays.forEach(day => {
                    let option=document.createElement("option");
                    option.textContent=day.getName();
                    option.value=day;
                    kirchentagTag.appendChild(option);
                });
            });
        };
    }
    catch(ex) {
        console.log(ex);
    }
}
