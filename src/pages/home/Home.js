import './Home.css';
import 'tabler-react/dist/Tabler.css';

import { Button, Grid } from 'tabler-react';
import React, { Component } from 'react';

import Confetti from 'react-dom-confetti';
import DrawForm from '../../components/DrawForm';
import { Helmet } from 'react-helmet';
import PreviouslyDrawnItemsBlock from '../../components/PreviouslyDrawnItemsBlock';
import { REVIEW } from '../Json-ld';
import SiteWrapper from '../../SiteWrapper';
import TextLoop from 'react-text-loop';
// import SponsorsSection from '../../components/SponsorsSection';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      drawItems: [],
      currentItems: [],
      pastDrawnItems: [],
      result: '',
      showTextAnimation: true,
      removeDrawnItem: false,
      animationInterval: 150,
      showResult: false,
      disableDrawButton: false,
      value: '',
      placeholder: 'Please enter the draw items here. One item per line.',
      valid: false,
      touched: false,
      validationRules: {
        minLength: 3,
        isRequired: true,
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSkipAnimationChange = this.handleSkipAnimationChange.bind(this);
    this.handleRemoveDrawnItemChange =
      this.handleRemoveDrawnItemChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.drawItems.length >= 0) {
      // let formInputItems = this.state.drawItems;
      // let itemList = formInputItems.split('\n');
      let itemList = ["Amelita Gabriela Galban", "Niquiel  Abela", "Jerico Rod Calibo", "Anna Fe  Perino", "Von Richard Ebron", "Vanessa Laurel", "Rina Felismino", "Ma. Teresa Santos", "Ismael De Vera", "Donna Rose Caguimbal", "Dolores Leal", "Arlyn Areta", "Jomari Delos Reyes", "Luningning Febelitas Pascual", "Liberato Abet Castro", "Rhea  Olave", "Kate Cornista", "Robert Lijauco", "Carmencita Mateo", "Javier Mateo", "Hazel Grace Masilungan", "Geraldine Abuan", "Marc Dionglay", "Gary Dela Pena", "Rommel Furoc", "Agrix Abelilla", "Maria Visiel Tolentino", "Oliver Pisueña", "Samantha Torres", "Roxanne De Gula-Barrion", "Cleodel Dispo", "Evelyn Chua", "Angela Marie Daayata", "Valerie Velez", "Maricris  Sanchez", "Jeric Mark Llesol", "Gillyn Azalea  Garin", "Maria Angela Tolentino", "Dorina Celeste Dionglay", "Maria Eloisa Carpena", "Rowena Bathan", "Dennis Augustus Reyes", "Maria Victora Villasan", "Estrella Abalos", "Donna Tejero", "Irma Moraga", "Nida Ortega", "Anna Lisa Batchar", "John Christopher Reyes", "Ana Marie Juliano", "Vicky Luis-Galarosa", "Edwin Luis", "Jasper Joshua Valdez", "Johnny Lu", "Amel June Guadalquiver", "Jay Matthew Hernandez", "Ivy Pesebre", "Julie Barba", "Rosemarie  Magnaye", "Erik Virgil Aguirre", "Re Orcine", "Maryjoy Orcine", "Anbriel Dejumo", "Abrielle Gonzalvo", "Mary Grace Cruz", "Majesty Morfe", "Ramona Maria Ana  Martinez- Bautista", "Mikhail  Buston", "Ma. Regina Optial", "Eduardo Geñoso", "Sheila Ramos", "June Ray Clemena", "Robinson  Jay Ulep", "Geraldbeau Licarte", "Ezerjan Murillo", "Janice Garcia", "Rudyard Marlowe Cruz", "Ramon Christopher Legion", "Caselyn Joyce  Altoveros", "Benito Oliveros", "Raquel Dolina", "Bianca Ysabel Cruzado", "Jocelyn Cacao", "Eloisa Gatmaitan", "Gino Taboy", "Jorlan Oreste", "Maricris Naag", "Cezar Policarpio", "Cielito \"Jun\" Castro", "Hannah Rustia", "Arch Aaron Hererra", "Maria Cristina \"Falls\" De Leon", "Julieta  Buban", "Maria Johanna  Ting", "Derrick Allen Soriano", "Cynthia  Canlobo", "Alex  Lumbera Jr.", "Matthew Nazarel Denus", "Van Allen Poblete", "Ree Alexa Suerto", "Arnel  Gloriani", "Mary Jane Hernandez", "Jolly Angelo Mamaril", "Jeramy Desamero", "Jhona Marie Gamboa", "Dyan Katherine Herrera", "Juvy Castillo", "Marilou Espiritu", "Sarah Pahm", "Crispin  Cruz", "Patricia Amor Bustos", "Jenn Louise Ipil", "Jonathan Clyde Jaro", "Ma. Eloisa Hernandez", "Dan Dennis Dizon", "Ma. Anelynne Labanen-Balba", "Nathaniel Caguioa", "Nancy Romano", "Ana Loraine Tenorio", "Angel Joy  Basnillo", "Timothy Paolo Bagui", "Josefina Cruz", "Geraldin Vidal-Rendon", "Jaimee Rose Gabanes", "Giezel Gutierrez", "Zarah Larano", "Allan Domencil", "Gabriel Villanueva", "Jaster John Iligan", "Glesly Joy Villanueva", "Audry Rose Ceniza", "Petronilo Abuan", "Krizelle Irish Sotalbo", "Maria Cristina Soledad  Danila", "Evangeline Abella", "Teresa Aguda", "Danielle Marie Estacio", "Riza Tambalque", "Elizabeth  Tan", "Maricon Pino", "Ma Antonette Miranda", "Shiela May  Patriarca", "Antonio Augustus Laranas", "Nadine Andal", "Appin Pinkihan", "Sherryl Cawaling", "Alma Jauhari", "Rhea  Figarola", "Loida Famorcan", "Johan  Susana", "Kenneth Lorenzo", "Jeson Rabe", "Noli Badillo Jr", "Clyde Anthony Dueñas", "Kristine Peralta", "Bea Joson", "Ma. Kriselle Pecaña", "Michaelito Naldo", "Bryan  Taala", "Christian Albert Jacob", "Rinnah  Agad", "Rosanna Gonzales", "Eleanor Israel", "Elma  Banga", "Alvinar Anuddin", "Elma Alcantara", "Mary Joy Reyes", "Generoso Oba Jr.", "Mae Bautista", "Hymnrich James Rosaot", "Ma Theresa Tayag", "Rizle Hilbero", "Charmaine May Calda", "Jayson Silva", "Elvin Mance", "Beatrice Daniella Negosa", "Odeza Aguila", "Marien Dara Rivera", "Joseph Alan Costales", "Edward Vincent Villarosa", "Ronaldo Pascual Jr", "Aldrich Jan Martin", "Nina Claudia Candolesas", "Melchor  San Juan", "Luisito Sagun", "Alberto Kalaw", "Earl Andreu Acabal", "Diczen Maitim", "Jayson Tapire", "Noah Jamil Tandang", "Eddel Bihis", "Anna Patricia Braganza", "Angela Bael", "Elvin Bihis", "Katrina Delgado", "Laarnie Michelle  Antonio", "Richard Rapisura", "Marlon Boncalos", "Kristel Garcia", "Angelica Sarmiento", "Ma Shiela Encinas", "Michael Encinas", "Ermin Magtagnob", "Moises John Reyes", "Mary Grace Latag", "Daisy De Castro", "Ronel Aldovino", "Mayette Domencil", "Anna Marjorie Joy Zuñiga", "Romelia Macasaet", "Jessie Joaquin", "Dario  Crisostomo", "Justice Cabuhat", "Dr. Exequiel Brobio", "Alexander Lam", "Ronaldo, Jr. Sincioco", "Sandra Pervera", "Laurenz James De Matta", "Jun Bregaudit", "Ryan Von De Leon", "Frandfhel Soriano", "Selda Hernandez", "Theresa Uson", "Mary Rose Sampani", "Analou Manaog", "Lyniel James De Castro", "Jhoanna Santos", "Cristine Joy Manejero", "Juanitz Misa", "Kim Albert Perlado", "Jose Antonio Cernechez Jr.", "Eunice Cai", "Adrienne Martines", "Manolito Villarica", "Ellen  Martines", "Michael  Martinez", "Jelord Sumaya", "Mon Tagle", "Rhoel Estrada", "Jose Gabriel Almazan", "Mon Hedelson Antonio", "Fidelino Asuzano", "Rory Jay Conte", "Soleil  Cabigting", "William Riley", "Brenda Ta Ala", "Stanley James Chong", "Maricel Leynes", "Glecy Garcia", "Gil Christian  Rafinian", "Rodney Ta-Ala", "Prudencio Rico Ocampo", "Marcelino  Antonio", "Rodel Cueno", "Chris Cobacha", "Adrian Morales", "Emma Zoleta", "Melanie Barte", "Kristel Ann La Rosa - Raz", "Christopher Munoz", "Cedie Cielo", "Ericka Suyat", "Alyssa Antong", "Andreas Lemme", "Dulcimore Cruz", "Erick James Jose", "Deneb Arriesgado", "Michael Medina", "Lita Manktelow", "Arlene De Ramon", "Maria Elvie Sabadera", "Joana Espiritu", "Michael  Pasco", "Cristopher Lozada", "Rhona Niña Reyes", "Sherraine Gaming", "Deonella Mae Borce", "Rosario Arcelia Alejar", "Jose Karlo Cardona", "Kraniel Masilungan", "Menchie Aguilar", "Marites Delen", "Pedro Urriola", "Jhona Calisay", "Edison Borgoños", "Nina Divina Grace Magpugay", "Nicolette Raya", "Mary Grace Lozano", "Jean Marjorie Centeno", "Ma Cristina Perez", "Jong Rosuman", "Richard Aum", "Kevin  Teh", "Erlyna Vidal", "Peache De Leon", "Janice Javier", "Edgar Allan Sandoval", "Allonagay Cabog", "Carlos Lorenzo Carlos", "Froilan Mendoza", "Watwarat Janjariyakul", "Geraldine Laguardia", "Jerick Teja", "Aldwin Reyes", "Nelson Manglo", "Jo Vicente Mapa", "Cris Paglinawan", "Franco Pitargue", "Christopher Patawaran", "Dexter Amada", "Kyle Davidson Huang", "Michael Bustos", "Myla Rose Bernal-Ocleaza", "Karen Mae  Mangubat", "Gabrielle Albertha Burgos", "Irma San Juan", "Christian Rennel Lantin", "Noel  Bonita", "Lily Ilao", "Lissette Añonuevo", "John William Gamis", "Angelo Mauro Guiab", "Antonina Alisa Celestino", "Dorbien Neil Peralta", "Kristine  Lopez", "Chromose Gene Pasaje", "Jennifer  Juanillas", "Mery Jane Bandolon", "Elmer Pat", "Mari Ramelle Gregorio", "Christine Faye Mangaoil", "Anna Mae  Origenes-Cubio", "Karen Mae Garcia-Valderama", "Noel Salazar", "Neneth Garan", "Addie Deanne Alday", "Ron Gabriel Optial", "Monica Joy Dela Cruz", "Florante Jr. Dela Vega", "Princess Joy Esureña", "Melyn  Laylo", "Laurent Laio De Roma", "Paul Alan Brucal", "Luis Ajay De Belen", "Lester  Jacela", "Joseph Angelo  Geli", "Yda Precilla Danao", "Marcos Biteng", "Maria Theresa Geli", "Ronald Magracia", "Roberto Luis Raya", "Kenneth Kim Salvador", "Patrapan Rungcharoen", "Navapat Pipatpaitoon", "Reinier Villanueva", "Rosalia Destura", "Clarisse  Villanueva", "Rosalyn Ortiz", "Elmer John Cabangon", "Leonides Garcia", "Arnel Bustamante", "Alduane  Gallevo", "Norly Luis  Salazar", "Relieza  Delasan", "Roderick  Adriano", "Catharine Cantilang", "Herbert Juaneza", "Christine Obdulia Cordura", "Melo Grace Dela Gracia", "Rialyn Santos", "Andro Meynard  Bartolome", "Marife Guteza", "Edna Alconera", "Gina Medina", "Alberto Louis Basinillo", "Oscy Balangiao", "Jocelyn Mariquilla", "Ricafort Henry Tallud", "Gilbert Perez", "Cheramaighn Duraliza", "Adrian Rigor", "Edalee Limcaoco", "Rochelle Vecino", "Lei Santillan", "Mary Rose Bajamonde", "Alicia Jumapao", "Francis Tagle", "Janus Cornejo", "Jose Limbay Lahi  Espaldon", "Therese Ann Medina", "Ricardo Judd  Dimalibot Jr.", "Ma. Faye Tersona", "Gilchrist  Mendoza", "Pamela Angela Doronio", "James Regienald Doronio", "Anton Tagle", "Chino Robin Borja", "Joseph  Vilela", "Joseline  Vilela", "Michael Policarpio Jr.", "Mary Loyce Abelilla", "Marie Fe  Iranzo", "Marian Encarnacion", "Angelique Militante", "Cyra Balbuena", "Caroline Mendoza", "Myrna Maliwat", "Lycel Javillonar", "Derrick Clarin", "Nelia Satiada", "Joseph Olarve", "Jemisa Claire Vasquez", "Maria Aiza Gamido", "Parita Noisamran", "Palida Wisedbubpha", "Ramon Leuterio", "Adam Julius  Palacpac", "Roy Miguel Flores", "Lyle Lehayan", "Glen  Banogon", "Norman  Solis", "Melba Villaraza", "Arnel Rigor", "Micah Grace Juano", "Sheryl Azette Capa", "Pamela Marie Canlas", "Roanna Porlares", "Katherine Atayde", "Don Mclain Remoral", "Sharlaine Joi Ann  Orense", "Geraldbeau Licarte", "Evangeline Fernando", "Filomena Pascual", "Jennifer  Solitario", "Ali Mohaliddin", "Lemuel  Armada", "Felicio Jr Atienza", "Jaymarie Regachuelo", "Michael Ross Crizaldo", "Alexandra Ashley Pelayo", "Jay Claire Lambong", "Imie Lyn Molina", "Edu Jay Jambangan", "Marlon Regachuelo", "Thomas Felske", "Laura Van Der Woude", "Rochelle Flores", "Dr. Lily Li", "Maria Cecilia Rabanera", "Esperanza Bolado", "Rowena Cortes", "Marivic De Vera", "Beob Gyun Kim", "Justin Caoagdan", "Rene Santiago", "Jovit Villanueva", "Ara Kathleen Bagunu", "Chaya Mae Lavilla", "Francis Paulo  Calvo", "Arthur Jay Ortega", "Qian Zhang", "Sherald  Vizconde", "Rolando Vidor", "Verden  De Roma", "Kostas Stamatopoulos", "Roderick Ramirez", "Donilyn Gibas", "Cheneth Gutierrez", "Liezel De Guzman", "Dr. Christian  Lückstädt", "Cherry Ann  G.  Espineli", "Allen Joseph Canta", "Richard Jordan  Anayasan", "James Ave", "Kristy Naldo", "Catherine Avedoza", "Lila Isabel Ramos", "Angelica Mari Tolentino", "Leigh Jastine Ramilla", "Koleene Hazel Cabrera", "Alfredo Rafael Ignacio Jr.", "Lalaine  Mendoza", "John Marious Dela Cueva", "Dimatatac Rosemarie", "Orlito Dayo", "Jorge Bautista", "Janette  Sta.Lucia", "Paulo Niko David", "Gina Principe", "Basilisa Reas", "Katherine  De Castro", "Angelie Magarro", "Mary Ann Carandang", "Kristine Cordova", "Denard Samson Tuyo", "Jovelyn Pejana-Betia", "Rosenie Langusta", "Russell Mae Rendon", "Trixie Ann  Resurreccion", "Aron Gatilogo", "Christian Santiago Rangel", "Charlie Millanes", "Marvin Palmes", "Jerome Claus", "Virginette Evangelista", "Victorio Dela Torre", "Cheryl Gonzales", "Argie Lloyd Morales", "Kylla Joyce Aguilera", "Emily Angeles", "Glady Lyn Manangkil", "Melvin Burac", "Karen Mae Bautista", "Erlyn Escalona", "Karla Joy Gayosa", "Catherine Lalap", "Camille Bacolod", "Gladys Cabotage", "Glenn Alfred Ferriol", "Catherine Ariela  Roxas", "Agnes  Labis", "Mark Anthony Dela Cruz", "Rodolfo Jr. Gabriel", "Elsie Mata", "Mark Joseph Gumatay", "Emelson Reyes", "Sofia Gonzales", "Val Manzo", "Jethro Felipe Jr", "Geasan  Maylem", "Nida Vasquez", "Chantal Marie Ventura", "Sheryll Burac", "Danika Aristine Lim", "Mary Sheane Bairan", "Jane Papas", "Catherine De Castro", "Mark Navarro", "Lanny Sutedjo", "Rennier  Britannia", "Leo  Padua", "Vanne Joshua Ribuca", "Patricia Mae Odrada", "Marlon Mariano", "Jayson De Castro", "Vivian  Solis", "Cesar Alvear", "Emmanuel Laguardia", "Raniel De Leon", "Cherry De Asis-Molina", "Laiza Joy Garo-Bucao", "Maria Lyra Sumaylo", "Benito Gorubat", "Cristia Bonifacio- Lin", "Cyrus Jiro Bonifacio", "Ma. Day Patricia Serviento", "Aiza Serviento", "Alfredo Cruz", "Alvin Vizconde", "Rosandro Dela Cruz", "Lawrence Baslote", "Edward Villona", "Hugo Romero", "Maria Laila Miclat", "Anthony Francis Regaspi", "Isa Tan", "Kiane Mari Romero", "Cellito Mendoza", "Miriam Manuel", "Corazon Rivera", "Royd Joseph Mosaso", "Jose Carlo Leongson", "Sofia Alexine Leongson", "Sherwin Camba", "Michael Angelo Maiz", "Alyssa Talag", "Patricia May Reyes", "Leonardo Signo", "Eric Dimacali", "Ryan Jordan Ramos", "Jennifer Maralit", "Jose Petronio Español", "Johary Hermoso", "Diana Lyn Gozos - Untiveros", "Jernan Ferrer", "Irene Baldovino", "Almond Ray Baldovino", "Michelle Joan Serrano", "Mutya Arabit", "Lois Rene Reyes", "Mina De Guzman", "Joshue Ian  Falla", "Raymond Cristopher Salvacion", "Maria Faye Alvaran", "Bea Angelic Garcia", "Freddie Reyes", "Elmer Vitug", "Jean Gales Brinkman", "James Lualhati", "Jusa Banda", "Cherrylou Gonzales", "Eleanor Angulo", "Christine Kesner", "Roberto Zaplan", "Nemie Falconite", "Rea Lynn Franco", "Emmanuel Manalang", "Amy April Amor Yu-Sarez", "Nicola Panciroli", "Fenn Franco", "Jace Berlanga", "Hana Ferrer", "Nikki  Cervantes", "Odette Nacua", "Julie Anne  Parato", "Rowena  Torreña", "Anthony Apolinario", "Julie Mae Bala", "Danalli Sta. Maria", "Joice San Andres", "Ma. Cristina Manabat", "Leonard Amatorio", "Junel Castillo", "Bettina Robyn Mateo", "Allyssa Joves", "Maria May Baltazar", "Seth Vincent Valdez", "Emerson Ramojal", "Charisa Entredicho", "Annalisa Manuel", "Marvin Miranda", "Mary Grace Durwin", "Lenitta Lopez", "Melvin Casiñas", "Arnaldo Jake Rivera", "Juan Carlos Saniano", "Edizon Vitug", "Michael Angelo Mercado", "Ma. Christabel Gaba", "Ryan Crizaldy Cura", "Raven Parreño", "Monavel Pascual", "Jim Ren", "Macque Emmanuel Pilapil", "Sherwin Abuel", "Noel Lumbo", "Callen Rodelas", "Michael Torte", "Venus  Guillermo", "Felimon  Tumanguil", "Addirose Gillian Articona", "Julius Bruce Dimaano", "Edison Roxas", "Paulo Argañosa", "Arthus Angelo Roxas", "Lervyn  Rebugio", "Benito Bautista", "Raquel  Custodio", "Ezechiel  Adoremus", "Angelica Magno", "Melojean Morales", "Ricciena Mari Arguelles", "Lance Gullian Biton", "Ken Alfonso Fernandez", "Hannah Agapay", "Anna Marie Burawin", "Louie Rule", "Johnben Lee", "Decelyn Barrientos", "Robin Tan", "Auribeth Ragos", "Randy  Alegria", "Richard Sanico", "Glenn Kenneth Libuit", "Jessica Nila Santiago", "Amir Ghane", "Antero Corpuz", "Stella Mae San Victores", "Mark  Bestes", "Consuelo  Maroon", "Jodie Maclang", "Duana May Cabodil", "Alvincent Hambre", "Alyssa Jane Padilla", "Janssen De Castro", "Mark Ace Mandilag", "Remylene Joy Degollado", "Kevin Michael Joaquin", "Carlos  Ambal", "Rosalina Lapitan", "Remilyn Mina", "Emelio Eslit", "Michelle Jalbuena", "Sheryllyn Ortiz", "Karen  Hosme", "Ricardo  Reyes", "Jonathan Michael Merca", "Aubrey Nicole Esperanza", "Rodell  Sola", "Dyan  Mansilungan", "Earl Ryan Carreras", "Ron Ryan Bustria", "Rommel  Sulabo", "Elvie Marie Regaspi", "Jethro Cuarez", "Leonora Caibal", "Rolando Labaniego", "Juan Carlo Renier", "Dan Leal Munar", "Francis Victor Apego", "Richard Ramos", "Augustus Creencia", "Julie Ross Datuin", "Ameer  Pahm", "Tana Ros Ranada", "Julius Jerome Ele", "Arnel  Del Barrio", "Hannah Katrina Servida", "Leoren Anna Afuang", "Felix C. Lazaro Jr.", "Jose Djairus Mari Martinez", "Maricar Dela Cruz", "Reychelle Marie Estrabo", "Jewel Neil Sa. Cataluña", "Richard Elliot", "Dr. Mart Roland Ozaeta", "Roselle Cudal", "Niel L. Ningal", "Joshua Llanes", "Bong R. Alvarez", "Randy R. Lobos", "Juan Miguel Palo", "Ralph Jovi Saldajeno", "Juzie Mae Carmona", "Almira  Cortez", "Ma. Angelica Cobilla", "Rhoda C Garcia", "Lorence Leo Zamora", "Estela Talipan", "Ronalyn Cardona", "Bless Enoval", "Jelly Tanpoco", "Lord Joy Clapano", "Arcilla Nezy", "Chesa Elenterio", "Sarah Krisha Arsua", "Jocelyn Tolentino", "Diana Caballero", "Lennie Raz", "Jenalyn Joy Dizon", "Jopeth Tristan  Enrico", "Ramon Bien", "Lucila Lacorte", "Maryjane Figueroa", "Julius Martin Quiacos", "Tessie  Cadacio", "Rhojellyne Valderama", "Martin Mirabuenos", "Selpha Trinidad", "Reynna Mae Deliarte", "Ernelin Dalangin", "Theerasid Ponsamak", "Clarisa Lope", "Chanchai Chairattanasat", "Ghenell Brabante", "Taveesak Janetanakit", "Clarissa David", "Suthasinee Udchachon", "Jhoben Harina", "Raymund Jamelo", "Maria Fe Bulao", "Ivan King Villanueva", "Andreas Lewke", "Giselle Robes", "Aimee Dilag", "Suzette Maisa", "Norvin Espiritusanto", "Reyena Ann Frixle Luna", "Reyciq Tolentino", "Erwin Pascua", "Bagamel Ramos", "Lilibeth  Unay", "Gracelene Valencia", "Mavie Kae Bercero", "Roger Belmonte", "Jayfer Gacusan", "Karl Alexander Fabros", "Ruel Gonzales", "Jefrey Querubin", "Jerome Pisuena", "Martyn Jerico Tan", "Julita Salamanca", "Juan Salamanca Jr", "Antonio  Barroga", "Mario Labadan", "Kit Villapando"];
      this.setState({
        ...this.state,
        items: itemList,
        currentItems: itemList,
      });
    }
  }

  handleChange(e) {
    this.setState({ [e.name]: e.value });
  }

  handleSkipAnimationChange = () => {
    this.setState({ showTextAnimation: !this.state.showTextAnimation });
  };

  handleRemoveDrawnItemChange = () => {
    this.setState({ removeDrawnItem: !this.state.removeDrawnItem });
  };

  sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  randomDrawItem = () => {
    const { currentItems, showTextAnimation, removeDrawnItem } = this.state;
    this.setState({
      ...this.state,
      showResult: false,
      disableDrawButton: true,
    });

    let maxItemIndex = currentItems.length;
    const randomIndex = Math.floor(Math.random() * maxItemIndex);
    this.sleep(showTextAnimation ? 5000 : 0).then(() => {
      this.setState({
        ...this.state,
        result: currentItems[randomIndex],
        pastDrawnItems: [
          ...this.state.pastDrawnItems,
          currentItems[randomIndex],
        ],
        showResult: true,
        disableDrawButton: false,
      });
    });
    if (removeDrawnItem) {
      const copyCurrentItems = [...this.state.currentItems];
      copyCurrentItems.splice(randomIndex, 1);
      this.setState({
        currentItems: copyCurrentItems,
      });
    }
  };

  render() {
    const {
      items,
      drawItems,
      currentItems,
      result,
      disableDrawButton,
      pastDrawnItems,
      placeholder,
      showResult,
    } = this.state;
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <script type="application/ld+json">{REVIEW}</script>
        </Helmet>
        {items.length !== 0 && (
          <div className="draw-block">
            <Grid.Row className="justify-content-center align-items-center w-100">
              <Grid.Col md={5} sm={12}>
                <div className="draw-section">
                  {!showResult && items && (
                    <TextLoop
                      className="draw-text text-center"
                      interval={130}
                      springConfig={{ stiffness: 200, damping: 10 }}
                      children={items}
                    />
                  )}
                  <Confetti active={this.state.showResult} />
                  {showResult && result}
                </div>
                <Button
                  block
                  name="drawButton"
                  color="primary"
                  onClick={this.randomDrawItem}
                  disabled={disableDrawButton || currentItems.length <= 1}
                >
                  {disableDrawButton ? 'DRAWING...' : 'DRAW'}
                </Button>
              </Grid.Col>
              <Grid.Col md={4} sm={12}>
                <PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />
              </Grid.Col>
            </Grid.Row>
          </div>
        )}
        <Grid.Row className="justify-content-center pt-5">
          <Grid.Col xs={12} md={8}>
            <DrawForm
              className="draw-form"
              drawItems={drawItems}
              onSubmit={this.handleSubmit}
              handleSkipAnimationChange={this.handleSkipAnimationChange}
              handleRemoveDrawnItemChange={this.handleRemoveDrawnItemChange}
              onChange={this.handleChange}
              placeholder={placeholder}
            />
          </Grid.Col>
        </Grid.Row>
        {/* <SponsorsSection /> */}
        {/* <Grid.Row>
          <Grid.Col xs={12} md={6} className="review-section">
            <h2>What Our Users Say</h2>
            <div className="powr-reviews" id="83081483_1602856389"></div>
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <div
              className="fb-page"
              data-href="https://www.facebook.com/luckydraw.me/"
              data-tabs="timeline"
              data-width=""
              data-height=""
              data-small-header="true"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite="https://www.facebook.com/luckydraw.me/"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/luckydraw.me/">
                  LuckyDraw.me
                </a>
              </blockquote>
            </div>
          </Grid.Col>
        </Grid.Row> */}
      </SiteWrapper>
    );
  }
}

export default App;
