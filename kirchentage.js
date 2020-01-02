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

Calendar = {
    YEAR:1,
    MONTH:2,
    WEEK_OF_YEAR : 3,
    WEEK_OF_MONTH : 4,
    DATE : 5,
    DAY_OF_MONTH : 5,
    DAY_OF_YEAR : 6,
    DAY_OF_WEEK : 7,

    SUNDAY : 7
}

Datum = class {
    year;
    month;
    day;
    julian;

    constructor(year,month,day,julian) {
        this.year=Math.floor(year);
        this.month=Math.floor(month);
        this.day=Math.floor(day);
        this.julian=julian;
    }
}

GregorianCalendar = class {
    julianDay;
    julian=false;
    firstGregorianDay=2299159.5;
    switchDate=this.calc(this.firstGregorianDay);

    constructor(year, month, day, julian=false) {
        this.setJulian(julian);
        this.set(year,month,day);
    }

    setJulian(julian) {
        this.julian= (julian==1 || julian=="1")?true:false;
    }

    set(datum) {
        this.setJulian(datum.julian);
        this.set(datum.year,datum.month,datum.day);
    }

    set(year,month,day) {
        // https://de.wikipedia.org/wiki/Julianisches_Datum#Umrechnung_Kalenderdatum_%E2%86%92_JD
        let Y,M,D,B;
        if(month > 2) {
            Y = year;    
            M = month;
        } 
        else {
            Y = year-1;  
            M = month+12
        }
        D = day;   // inklusive Tagesbruchteil
        
        if(this.julian || this.isBeforeSwitchDate(year,month,day)) {
            B = 0;
        } 
        else {
            B = 2 - Math.floor(Y/100) + Math.floor(Y/400);
        }
     
        this.julianDay =  Math.floor(365.25*(Y+4716)) + Math.floor(30.6001*(M+1)) + D + B - 1524.5;
    }

    isBeforeSwitchDate(year,month,day) {
        if(year > this.switchDate.year) return false;
        if(month > this.switchDate.month) return false;
        if(day > this.switchDate.day) return false;
        return true;
    }

    setFirstGregorianDay(year,month,day) {
        this.firstGregorianDay = Math.floor((1461 * (year + 4800 + (month - 14)/12))/4 +(367 * (month - 2 - 12 * ((month - 14)/12)))/12 - (3 * ((year + 4900 + (month - 14)/12)/100))/4 + day - 32075);
        this.switchDate=calc(this.firstGregorianDay);
    }

    calc(JD=this.julianDay) {
        let isJulian=this.julian || JD < this.firstGregorianDay;

        // https://de.wikipedia.org/wiki/Julianisches_Datum#Umrechnung_JD_%E2%86%92_Kalenderdatum
        let Z = Math.floor(JD + 0.5);
        let F = JD + 0.5 - Z;
        let A = Z; 
        if(!isJulian){
            let a = Math.floor((Z - 1867216.25)/36524.25);
            A = Z + 1 + a - Math.floor(a/4);
        }
         
        let B = A + 1524;
        let C = Math.floor((B - 122.1)/365.25);
        let D = Math.floor(365.25*C);
        let E = Math.floor((B - D)/30.6001);
         
        let Tag = B - D - Math.floor(30.6001*E) + F;   // inklusive Tagesbruchteil
        let Monat,Jahr;
        if(E <= 13){
            Monat = E - 1;
            Jahr = C - 4716;
        }
        else {
            Monat = E - 13;
            Jahr = C - 4715;
        }
        return new Datum(Jahr,Monat,Tag,this.julian);
    }
    
    get(field, value) {
        if(field == Calendar.DAY_OF_WEEK) {
            return (Math.floor(this.julianDay+.5) % 7)+1;
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

    toString() {
        let datum=this.calc();
        return datum.day+"."+datum.month+"."+datum.year+"("+(this.julian?"J":"G")+")";
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

function setDaysOfMonth() {
    let year=parseInt(document.getElementById("wochentage-jahr").value,10);
    let month=1+document.getElementById("wochentage-monat").selectedIndex;
    let julian=document.getElementById("wochentage-toggle").value;
    let buttons=document.getElementById("wochentage-kalender").getElementsByTagName("button");

    let cal=new GregorianCalendar(year,month,1,julian);
    let dow=cal.get(Calendar.DAY_OF_WEEK);
    let last=dow;
    do {
        last+=1;
        cal.add(Calendar.DAY_OF_MONTH,1);
    }while(cal.get(Calendar.MONTH)==month);

    for(let i=1;i<=buttons.length;i++) 
        buttons[i-1].innerHTML=(i>=dow && i<last)?(""+(i+1-dow)):"";
}

window.onload=function () {
    setDaysOfMonth();
    loadChurchDays();
}
