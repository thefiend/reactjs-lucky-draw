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
      let itemList = ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5", "Name 6", "Name 7", "Name 8", "Name 9", "Name 10", "Name 11", "Name 12", "Name 13", "Name 14", "Name 15", "Name 16", "Name 17", "Name 18", "Name 19", "Name 20", "Name 21", "Name 22", "Name 23", "Name 24", "Name 25", "Name 26", "Name 27", "Name 28", "Name 29", "Name 30", "Name 31", "Name 32", "Name 33", "Name 34", "Name 35", "Name 36", "Name 37", "Name 38", "Name 39", "Name 40", "Name 41", "Name 42", "Name 43", "Name 44", "Name 45", "Name 46", "Name 47", "Name 48", "Name 49", "Name 50", "Name 51", "Name 52", "Name 53", "Name 54", "Name 55", "Name 56", "Name 57", "Name 58", "Name 59", "Name 60", "Name 61", "Name 62", "Name 63", "Name 64", "Name 65", "Name 66", "Name 67", "Name 68", "Name 69", "Name 70", "Name 71", "Name 72", "Name 73", "Name 74", "Name 75", "Name 76", "Name 77", "Name 78", "Name 79", "Name 80", "Name 81", "Name 82", "Name 83", "Name 84", "Name 85", "Name 86", "Name 87", "Name 88", "Name 89", "Name 90", "Name 91", "Name 92", "Name 93", "Name 94", "Name 95", "Name 96", "Name 97", "Name 98", "Name 99", "Name 100", "Name 101", "Name 102", "Name 103", "Name 104", "Name 105", "Name 106", "Name 107", "Name 108", "Name 109", "Name 110", "Name 111", "Name 112", "Name 113", "Name 114", "Name 115", "Name 116", "Name 117", "Name 118", "Name 119", "Name 120", "Name 121", "Name 122", "Name 123", "Name 124", "Name 125", "Name 126", "Name 127", "Name 128", "Name 129", "Name 130", "Name 131", "Name 132", "Name 133", "Name 134", "Name 135", "Name 136", "Name 137", "Name 138", "Name 139", "Name 140", "Name 141", "Name 142", "Name 143", "Name 144", "Name 145", "Name 146", "Name 147", "Name 148", "Name 149", "Name 150", "Name 151", "Name 152", "Name 153", "Name 154", "Name 155", "Name 156", "Name 157", "Name 158", "Name 159", "Name 160", "Name 161", "Name 162", "Name 163", "Name 164", "Name 165", "Name 166", "Name 167", "Name 168", "Name 169", "Name 170", "Name 171", "Name 172", "Name 173", "Name 174", "Name 175", "Name 176", "Name 177", "Name 178", "Name 179", "Name 180", "Name 181", "Name 182", "Name 183", "Name 184", "Name 185", "Name 186", "Name 187", "Name 188", "Name 189", "Name 190", "Name 191", "Name 192", "Name 193", "Name 194", "Name 195", "Name 196", "Name 197", "Name 198", "Name 199", "Name 200", "Name 201", "Name 202", "Name 203", "Name 204", "Name 205", "Name 206", "Name 207", "Name 208", "Name 209", "Name 210", "Name 211", "Name 212", "Name 213", "Name 214", "Name 215", "Name 216", "Name 217", "Name 218", "Name 219", "Name 220", "Name 221", "Name 222", "Name 223", "Name 224", "Name 225", "Name 226", "Name 227", "Name 228", "Name 229", "Name 230", "Name 231", "Name 232", "Name 233", "Name 234", "Name 235", "Name 236", "Name 237", "Name 238", "Name 239", "Name 240", "Name 241", "Name 242", "Name 243", "Name 244", "Name 245", "Name 246", "Name 247", "Name 248", "Name 249", "Name 250", "Name 251", "Name 252", "Name 253", "Name 254", "Name 255", "Name 256", "Name 257", "Name 258", "Name 259", "Name 260", "Name 261", "Name 262", "Name 263", "Name 264", "Name 265", "Name 266", "Name 267", "Name 268", "Name 269", "Name 270", "Name 271", "Name 272", "Name 273", "Name 274", "Name 275", "Name 276", "Name 277", "Name 278", "Name 279", "Name 280", "Name 281", "Name 282", "Name 283", "Name 284", "Name 285", "Name 286", "Name 287", "Name 288", "Name 289", "Name 290", "Name 291", "Name 292", "Name 293", "Name 294", "Name 295", "Name 296", "Name 297", "Name 298", "Name 299", "Name 300", "Name 301", "Name 302", "Name 303", "Name 304", "Name 305", "Name 306", "Name 307", "Name 308", "Name 309", "Name 310", "Name 311", "Name 312", "Name 313", "Name 314", "Name 315", "Name 316", "Name 317", "Name 318", "Name 319", "Name 320", "Name 321", "Name 322", "Name 323", "Name 324", "Name 325", "Name 326", "Name 327", "Name 328", "Name 329", "Name 330", "Name 331", "Name 332", "Name 333", "Name 334", "Name 335", "Name 336", "Name 337", "Name 338", "Name 339", "Name 340", "Name 341", "Name 342", "Name 343", "Name 344", "Name 345", "Name 346", "Name 347", "Name 348", "Name 349", "Name 350", "Name 351", "Name 352", "Name 353", "Name 354", "Name 355", "Name 356", "Name 357", "Name 358", "Name 359", "Name 360", "Name 361", "Name 362", "Name 363", "Name 364", "Name 365", "Name 366", "Name 367", "Name 368", "Name 369", "Name 370", "Name 371", "Name 372", "Name 373", "Name 374", "Name 375", "Name 376", "Name 377", "Name 378", "Name 379", "Name 380", "Name 381", "Name 382", "Name 383", "Name 384", "Name 385", "Name 386", "Name 387", "Name 388", "Name 389", "Name 390", "Name 391", "Name 392", "Name 393", "Name 394", "Name 395", "Name 396", "Name 397", "Name 398", "Name 399", "Name 400", "Name 401", "Name 402", "Name 403", "Name 404", "Name 405", "Name 406", "Name 407", "Name 408", "Name 409", "Name 410", "Name 411", "Name 412", "Name 413", "Name 414", "Name 415", "Name 416", "Name 417", "Name 418", "Name 419", "Name 420", "Name 421", "Name 422", "Name 423", "Name 424", "Name 425", "Name 426", "Name 427", "Name 428", "Name 429", "Name 430", "Name 431", "Name 432", "Name 433", "Name 434", "Name 435", "Name 436", "Name 437", "Name 438", "Name 439", "Name 440", "Name 441", "Name 442", "Name 443", "Name 444", "Name 445", "Name 446", "Name 447", "Name 448", "Name 449", "Name 450", "Name 451", "Name 452", "Name 453", "Name 454", "Name 455", "Name 456", "Name 457", "Name 458", "Name 459", "Name 460", "Name 461", "Name 462", "Name 463", "Name 464", "Name 465", "Name 466", "Name 467", "Name 468", "Name 469", "Name 470", "Name 471", "Name 472", "Name 473", "Name 474", "Name 475", "Name 476", "Name 477", "Name 478", "Name 479", "Name 480", "Name 481", "Name 482", "Name 483", "Name 484", "Name 485", "Name 486", "Name 487", "Name 488", "Name 489", "Name 490", "Name 491", "Name 492", "Name 493", "Name 494", "Name 495", "Name 496", "Name 497", "Name 498", "Name 499", "Name 500", "Name 501", "Name 502", "Name 503", "Name 504", "Name 505", "Name 506", "Name 507", "Name 508", "Name 509", "Name 510", "Name 511", "Name 512", "Name 513", "Name 514", "Name 515", "Name 516", "Name 517", "Name 518", "Name 519", "Name 520", "Name 521", "Name 522", "Name 523", "Name 524", "Name 525", "Name 526", "Name 527", "Name 528", "Name 529", "Name 530", "Name 531", "Name 532", "Name 533", "Name 534", "Name 535", "Name 536", "Name 537", "Name 538", "Name 539", "Name 540", "Name 541", "Name 542", "Name 543", "Name 544", "Name 545", "Name 546", "Name 547", "Name 548", "Name 549", "Name 550", "Name 551", "Name 552", "Name 553", "Name 554", "Name 555", "Name 556", "Name 557", "Name 558", "Name 559", "Name 560", "Name 561", "Name 562", "Name 563", "Name 564", "Name 565", "Name 566", "Name 567", "Name 568", "Name 569", "Name 570", "Name 571", "Name 572", "Name 573", "Name 574", "Name 575", "Name 576", "Name 577", "Name 578", "Name 579", "Name 580", "Name 581", "Name 582", "Name 583", "Name 584", "Name 585", "Name 586", "Name 587", "Name 588", "Name 589", "Name 590", "Name 591", "Name 592", "Name 593", "Name 594", "Name 595", "Name 596", "Name 597", "Name 598", "Name 599", "Name 600", "Name 601", "Name 602", "Name 603", "Name 604", "Name 605", "Name 606", "Name 607", "Name 608", "Name 609", "Name 610", "Name 611", "Name 612", "Name 613", "Name 614", "Name 615", "Name 616", "Name 617", "Name 618", "Name 619", "Name 620", "Name 621", "Name 622", "Name 623", "Name 624", "Name 625", "Name 626", "Name 627", "Name 628", "Name 629", "Name 630", "Name 631", "Name 632", "Name 633", "Name 634", "Name 635", "Name 636", "Name 637", "Name 638", "Name 639", "Name 640", "Name 641", "Name 642", "Name 643", "Name 644", "Name 645", "Name 646", "Name 647", "Name 648", "Name 649", "Name 650", "Name 651", "Name 652", "Name 653", "Name 654", "Name 655", "Name 656", "Name 657", "Name 658", "Name 659", "Name 660", "Name 661", "Name 662", "Name 663", "Name 664", "Name 665", "Name 666", "Name 667", "Name 668", "Name 669", "Name 670", "Name 671", "Name 672", "Name 673", "Name 674", "Name 675", "Name 676", "Name 677", "Name 678", "Name 679", "Name 680", "Name 681", "Name 682", "Name 683", "Name 684", "Name 685", "Name 686", "Name 687", "Name 688", "Name 689", "Name 690", "Name 691", "Name 692", "Name 693", "Name 694", "Name 695", "Name 696", "Name 697", "Name 698", "Name 699", "Name 700", "Name 701", "Name 702", "Name 703", "Name 704", "Name 705", "Name 706", "Name 707", "Name 708", "Name 709", "Name 710", "Name 711", "Name 712", "Name 713", "Name 714", "Name 715", "Name 716", "Name 717", "Name 718", "Name 719", "Name 720", "Name 721", "Name 722", "Name 723", "Name 724", "Name 725", "Name 726", "Name 727", "Name 728", "Name 729", "Name 730", "Name 731", "Name 732", "Name 733", "Name 734", "Name 735", "Name 736", "Name 737", "Name 738", "Name 739", "Name 740", "Name 741", "Name 742", "Name 743", "Name 744", "Name 745", "Name 746", "Name 747", "Name 748", "Name 749", "Name 750", "Name 751", "Name 752", "Name 753", "Name 754", "Name 755", "Name 756", "Name 757", "Name 758", "Name 759", "Name 760", "Name 761", "Name 762", "Name 763", "Name 764", "Name 765", "Name 766", "Name 767", "Name 768", "Name 769", "Name 770", "Name 771", "Name 772", "Name 773", "Name 774", "Name 775", "Name 776", "Name 777", "Name 778", "Name 779", "Name 780", "Name 781", "Name 782", "Name 783", "Name 784", "Name 785", "Name 786", "Name 787", "Name 788", "Name 789", "Name 790", "Name 791", "Name 792", "Name 793", "Name 794", "Name 795", "Name 796", "Name 797", "Name 798", "Name 799", "Name 800", "Name 801", "Name 802", "Name 803", "Name 804", "Name 805", "Name 806", "Name 807", "Name 808", "Name 809", "Name 810", "Name 811", "Name 812", "Name 813", "Name 814", "Name 815", "Name 816", "Name 817", "Name 818", "Name 819", "Name 820", "Name 821", "Name 822", "Name 823", "Name 824", "Name 825", "Name 826", "Name 827", "Name 828", "Name 829", "Name 830", "Name 831", "Name 832", "Name 833", "Name 834", "Name 835", "Name 836", "Name 837", "Name 838", "Name 839", "Name 840", "Name 841", "Name 842", "Name 843", "Name 844", "Name 845", "Name 846", "Name 847", "Name 848", "Name 849", "Name 850", "Name 851", "Name 852", "Name 853", "Name 854", "Name 855", "Name 856", "Name 857", "Name 858", "Name 859", "Name 860", "Name 861", "Name 862", "Name 863", "Name 864", "Name 865", "Name 866", "Name 867", "Name 868", "Name 869", "Name 870", "Name 871", "Name 872", "Name 873", "Name 874", "Name 875", "Name 876", "Name 877", "Name 878", "Name 879", "Name 880", "Name 881", "Name 882", "Name 883", "Name 884", "Name 885", "Name 886", "Name 887", "Name 888", "Name 889", "Name 890", "Name 891", "Name 892", "Name 893", "Name 894", "Name 895", "Name 896", "Name 897", "Name 898", "Name 899", "Name 900", "Name 901", "Name 902", "Name 903", "Name 904", "Name 905", "Name 906", "Name 907", "Name 908", "Name 909", "Name 910", "Name 911", "Name 912", "Name 913", "Name 914", "Name 915", "Name 916", "Name 917", "Name 918", "Name 919", "Name 920", "Name 921", "Name 922", "Name 923", "Name 924", "Name 925", "Name 926", "Name 927", "Name 928", "Name 929", "Name 930", "Name 931", "Name 932", "Name 933", "Name 934", "Name 935", "Name 936", "Name 937", "Name 938", "Name 939", "Name 940", "Name 941", "Name 942", "Name 943", "Name 944", "Name 945", "Name 946", "Name 947", "Name 948", "Name 949", "Name 950", "Name 951", "Name 952", "Name 953", "Name 954", "Name 955", "Name 956", "Name 957", "Name 958", "Name 959", "Name 960", "Name 961", "Name 962", "Name 963", "Name 964", "Name 965", "Name 966", "Name 967", "Name 968", "Name 969", "Name 970", "Name 971", "Name 972", "Name 973", "Name 974", "Name 975", "Name 976", "Name 977", "Name 978", "Name 979", "Name 980", "Name 981", "Name 982", "Name 983", "Name 984", "Name 985", "Name 986", "Name 987", "Name 988", "Name 989", "Name 990", "Name 991", "Name 992", "Name 993", "Name 994", "Name 995", "Name 996", "Name 997", "Name 998", "Name 999", "Name 1000"];
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
