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
  }