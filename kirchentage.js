function openTab(element) {
    sections=document.getElementsByTagName("section");
    for(i=0;i<sections.length;i++) {
        sections[i].classList.remove("active");
    }
    tabs=document.getElementById("tabs").children;
    for(i=0;i<tabs.length;i++) {
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