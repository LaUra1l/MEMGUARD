console.log('czesc');


class Storage {
    constructor() {}

    // Zapisywanie elementu do storage
    saveItem(key, value) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ [key]: value }, function () {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Zapisano:', key, value);
                    resolve();
                }
            });
        });
    }

    // Pobieranie elementu z storage
    getItem(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get([key], function (result) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Pobrano wartość:', result[key]);
                    resolve(result[key]);
                }
            });
        });
    }

    // Usuwanie elementu z storage
    removeItem(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.remove([key], function () {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Usunięto:', key);
                    resolve();
                }
            });
        });
    }
}


class Note extends Storage {
    constructor() {
        super();
        // Pobrane notatki ze storage
        this.allNotes = [];
        this.loadNotes();
        // this.form = new Form();
        // this.removeItem('notes') 

    }

    // Załadowanie istniejących notatek z storage
    async loadNotes() {
        const notes = await this.getItem('notes');
        this.allNotes = notes || [];
        console.log('Załadowano notatki:', this.allNotes);
    }

    // Tworzenie notatki
    async createNote(title, definition, type, formClass,questionRequired = false) {
        const date = new Date().toLocaleString();
        const note = {
            title: title,
            definition: definition,
            type: type,
            date: date,
            formClass: formClass,
            questionRequired:questionRequired
        };

        this.allNotes.push(note);
        await this.saveItem('notes', this.allNotes); // Zapisujemy całą listę notatek
        console.log('Stworzono notatkę:', note);

        return note;
    }
    async showNotes(){
        await this.loadNotes();
        console.log('NOTTTT: ',this.allNotes)

        const btn = document.createElement('button');
        const section = document.createElement('section');
        section.className = 'notesContener'
        btn.className = 'btnShow';
        btn.textContent = 'Pokaż wszytskie notatki';
        const noti = new Notifications();

        if(document.querySelector('.content_getrestrew')){
            const contener = document.querySelector('.content_getrestrew');
            contener.appendChild(btn)
            btn.addEventListener('click',()=>{
                document.body.appendChild(section)
                
                this.allNotes.forEach((note,index) =>{
                    console.log(index,note)
                    noti.notificationElem(note,section);
                  
        
                })
            })
        }
        
        
    }

}

class Form {
    constructor() {
        this.tools = new Tools();
        this.note = new Note();
    }

    /**
     * Tworzenie formularza do dodawania nowej notatki
     * @param {HTMLElement} mainContener
     * @param {Array} classnames
     */
    create(mainContener, classnames) {
        const contener = mainContener;
        let questionsRequired = [];
        let txts = [];


        const form = document.createElement('form');
        form.className = classnames[this.randomNum(0, classnames.length)];
        form.id = 'formNote';

        const titleInp = this.#createInp('title', 'TYTUŁ', 'div');
        const defInp = this.#createInp('definition', 'TREŚĆ', 'div');

        const btnSubmit = document.createElement('button');
        btnSubmit.type = 'submit';
        btnSubmit.className = 'btnSubmit';
        btnSubmit.innerHTML = '<i class="fa-solid fa-check"></i><p>Ok</p>';

        const radioContener = document.createElement('div');
        radioContener.className = 'radioContener';
        radioContener.innerHTML = '<p>TYP</p>';

        const types = ['<b>NORMALNY</b> (nie trzeba spełniać żadnych warunków aby usunąć notatkę)','<b>WYMAGAJĄCY</b> (należy poprawnie odpowiedzieć na zadane pytanie)'];

        const questionContener = document.createElement('div');

        for(let i = 0; i<2; i++){
            const label = document.createElement('label');
            const inpRadio = document.createElement('input');
            inpRadio.type = 'radio';
            inpRadio.name = 'type';
            inpRadio.id = i;
            inpRadio.required = true
            label.innerHTML = types[i];

            if (i === 0) {
                inpRadio.checked = true;

                inpRadio.addEventListener('change', () => {
                    if (inpRadio.checked) {
                        console.log(questionContener)
                        this.#removeChildren(questionContener);
                    } 
                });

            } else {
                inpRadio.addEventListener('change', () => {
                    if (inpRadio.checked) {
                        console.log(questionContener)
                        questionsRequired = [...this.createRequirments(questionContener, form,'wpisz pytanie','wpisz odpowiedź')];
                        console.log(questionsRequired)

                        
                    } 
                });
            }

            

            label.appendChild(inpRadio)
            radioContener.appendChild(label)

        }

        btnSubmit.onclick = (e) => {
            e.preventDefault();

            if(questionsRequired.length > 0){


                txts = [];

                questionsRequired.forEach(elem=>{
                    txts.push(elem.innerText);
                    
                })
                console.log(txts)

                this.#submit(titleInp, defInp, radioContener ,form.className,txts)
            }else{
                this.#submit(titleInp, defInp, radioContener ,form.className);
            }
          
        };

        form.appendChild(titleInp);
        form.appendChild(defInp);
        this.tools.append(form);
        form.appendChild(radioContener)
        form.appendChild(btnSubmit);

        contener.appendChild(form);
    }

    // Obsługa wysyłania formularza i tworzenia notatki
    async #submit(titleElem, defElem, typeElem,formClass, questionRequired = null) {
        const title = titleElem.innerHTML;
        const definition = defElem.innerHTML;
        let type='';

        const elems = [...typeElem.childNodes];

        for(let i = 0;i<elems.length; i++){
            if(i === 0){
                continue;
            }
           console.log(elems[i].control)
           const elem = elems[i].control
           type = elem.id

        }

        if(questionRequired){
            const note = await this.note.createNote(title, definition, type, formClass,questionRequired);
            console.log('Nowa notatka:', note);

            alert('Zapisano pomyślnie :)')
        }
        else{
            const note = await this.note.createNote(title, definition, type, formClass);
            console.log('Nowa notatka:', note);

            alert('Zapisano pomyślnie :)')
        }

    }

    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    #createInp(id, placeholder, type) {
        const inp = document.createElement(type);
        inp.contentEditable = 'true';
        inp.textContent = placeholder;
        const p = document.createElement('p');
        p.className = 'p';
        inp.id = id;

        p.appendChild(inp);

        return p;
    }

    createRequirments(contener,form, questionTxt, responsetxt ){
        const question = this.#createInp('question',questionTxt,'div');
        const response = this.#createInp('response',responsetxt,'div');
        
        contener.appendChild(question);
        contener.appendChild(response);

        form.appendChild(contener)

        return [question,response];
    }
    #removeChildren(contener){
        while (contener.firstChild){
            contener.firstChild.remove()
        }

    }
}

class Tools {
    constructor() {
        this.activeTool = new Set(); // Zbiór aktywnych narzędzi
        this.properties = [
            // Pogrubienie
            {
                icon: '<i class="fa-solid fa-bold"></i>',
                function: this.boldFun.bind(this),
                id: 'bold',
                active: false
            },
            // Kursywa
            {
                icon: '<i class="fa-solid fa-italic"></i>',
                function: this.italicFun.bind(this),
                id: 'italic',
                active: false
            },
            // Zmiana koloru
            {
                icon: '<i class="fa-solid fa-palette"></i>',
                function: this.colorFun.bind(this),
                id: 'color',
                active: false
            }
        ];
    }

    /**
     * Aplikuje styl do zaznaczonego tekstu
     * @param {string} tag - tag HTML, który ma być użyty (np. <strong>, <i>, <span>)
     */
    #applyStyle(tag) {
        const selection = window.getSelection();
        if (!selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const newElement = document.createElement(tag);
            newElement.textContent = selection.toString();
            range.deleteContents();
            range.insertNode(newElement); // Zastępuje zaznaczony tekst nowym elementem
        }
    }

    // Funkcja do pogrubienia tekstu
    boldFun(button) {
        const property = this.properties.find(prop => prop.id === 'bold');
        property.active = !property.active;
        button.classList.toggle('activeTool', property.active);

        if (property.active) {
            this.activeTool.add('bold');
            if (window.getSelection().toString()) {
                this.#applyStyle('strong'); // Aplikuje pogrubienie do zaznaczonego tekstu
            } else {
                document.execCommand('bold'); // Ustawia pogrubienie dla przyszłego tekstu
            }
        } else {
            this.activeTool.delete('bold');
            document.execCommand('bold'); // Wyłącza pogrubienie
        }
    }

    // Funkcja do ustawiania kursywy
    italicFun(button) {
        const property = this.properties.find(prop => prop.id === 'italic');
        property.active = !property.active;
        button.classList.toggle('activeTool', property.active);

        if (property.active) {
            this.activeTool.add('italic');
            if (window.getSelection().toString()) {
                this.#applyStyle('i'); // Aplikuje kursywę do zaznaczonego tekstu
            } else {
                document.execCommand('italic'); // Ustawia kursywę dla przyszłego tekstu
            }
        } else {
            this.activeTool.delete('italic');
            document.execCommand('italic'); // Wyłącza kursywę
        }
    }

    // Funkcja do zmiany koloru tekstu
    colorFun(button) {
        const property = this.properties.find(prop => prop.id === 'color');
        property.active = !property.active;
        button.classList.toggle('activeTool', property.active);

        if (property.active) {
            this.activeTool.add('color');
            if (window.getSelection().toString()) {
                this.#applyStyle('span'); // Aplikuje zmianę koloru do zaznaczonego tekstu
            } else {
                document.execCommand('foreColor', false, '#ff0000'); // Ustawia czerwony kolor
            }
        } else {
            this.activeTool.delete('color');
            document.execCommand('foreColor', false, '#000000'); // Powrót do czarnego koloru
        }
    }

    // Dodaje narzędzia do głównego kontenera
    append(mainContainer) {
        const container = document.createElement('div');
        container.className = 'tools';

        this.properties.forEach(property => {
            const button = document.createElement('button');
            button.className = 'toolElem';
            button.innerHTML = property.icon;

            button.onclick = (e) => {
                e.preventDefault();
                property.function(button); // Przypisuje odpowiednią funkcję do przycisku
            };

            container.appendChild(button); // Dodaje przycisk do narzędzi
        });

        mainContainer.appendChild(container); // Dodaje narzędzia do kontenera
    }
}

class Notifications extends Note {
    constructor() {
        super();
        this.formFun = new Form();
    }

    #fixTxt(text){
        return text.replace('true','false')

    }

    // Wyświetlanie notatek
    notificationElem(note, contenerSpec = null) {
        // await this.loadNotes();

        // const note = this.allNotes[index]

        console.log('Wczytano notatkę:', note);

        let contener = '';
        if(!contenerSpec){
            contener = document.body
        }
        else{
            contener = contenerSpec
        }
        console.log("CONTENER TO : ",contener)
        const noti = document.createElement('div');
        noti.className = note.formClass + ' popup';
        noti.id = 'formNote';

        const titleSec = this.#createSection('t', this.#fixTxt(note.title), 'div');
        const defSec = this.#createSection('d', this.#fixTxt(note.definition), 'div');

        const btnDelete = document.createElement('button');
        btnDelete.className = 'btnDelete';
        btnDelete.innerHTML = '</i><p>Usuń</p>';

        btnDelete.onclick = (e) => {
            e.preventDefault();
            this.#deleteNotification(noti, note.title);
        };

        if(contenerSpec){
            noti.style.position = 'unset'
        }

        
        noti.appendChild(btnDelete);
        noti.appendChild(titleSec);
        noti.appendChild(defSec);
        contener.appendChild(noti);
       

        if(note.questionRequired){
            console.log('wymagajacy');
            btnDelete.style.visibility = 'hidden'
            


            const questionContener = document.createElement('div');
            questionContener.className = 'questionDiv';
            const elems = this.formFun.createRequirments(questionContener,noti,note.questionRequired[0],'...');

            console.log(elems[1],"JEDEN")

            console.log("PYTANIE: ",note.questionRequired[0],note.questionRequired[1])

            elems[1].dataset.response = note.questionRequired[1];

            const btn = this.#createBtn();
            btn.innerHTML = '</i><p>Ok</p>'
            noti.appendChild(btn)

            btn.addEventListener('click',()=>{
                work()

            })
            window.addEventListener('keydown',(e)=>{
                if(e.key === 'Enter'){
                    work();
                }
                
            })

            function work(){
                console.log('click',elems[0].textContent,elems[1].textContent);

              
                if( elems[1].textContent.toLowerCase().trim() === note.questionRequired[1].toLowerCase().trim()){
                    console.log('ok');
                    btnDelete.style.visibility = 'visible'
                }
            }
           
        
        }
       

        
    }

    #deleteNotification(form) {
        form.remove();
   
    }

    #createBtn(){
        const btn = document.createElement('button');
        btn.className = 'btnSubmit'

        return btn;
    }

    #createSection(id, content, type) {
        const elem = document.createElement(type);
        elem.innerHTML = content;
        const p = document.createElement('p');
        p.className = 'p';
        elem.id = id;

        p.appendChild(elem);

        return p;
    }

    async start(){
        await this.loadNotes();
        const index = this.formFun.randomNum(0,this.allNotes.length)
        const note = this.allNotes[index]
        this.notificationElem(note)
       
    }

    init(){
        const time = 60000;
        setInterval(()=>{
            this.start()   
        },time)
    }
}



// Uruchamianie aplikacji
const form = new Form();

if(document.querySelector('.content_getrestrew')){
    const contener = document.querySelector('.content_getrestrew');
    form.create(contener, ['noteForm','noteForm2','noteForm3']);

}



const notifications = new Notifications();
notifications.init();


const notes = new Note();
notes.showNotes()


// const ai = new Ai();
// const note = "Gwiazda Polarna. Aktualna gwiazda polarna widoczna z północy nazywa się Polaris"; // Przykładowa notatka

// Wywołanie analizy notatki
// ai.analyzeNote(note).then((suggestion) => {
//     console.log("Propozycja AI:", suggestion);
// }).catch((error) => {
//     console.error("Wystąpił błąd podczas analizy notatki:", error);
// });




