// Figma MCP call #3: get_design_context, file pEdVK9upunNouPDObQQXe4, node 1:506 (HERO Baner), 2026-11-25.
// Raw response, reference only (React + Tailwind); never copy it into the page.
// Screenshot from the same call: 03-design-context-hero.png.
// The asset URLs below are temporary (they expire after 7 days) and were NOT downloaded:
// every asset has a local equivalent in assets/raw/ (see LOG.md).
const assetPathPrefix = "https://www.figma.com/api/mcp/asset/b94396b9-ba7a-4e45-a452-a4741340207d";
const imgHeroBaner = `${assetPathPrefix}/f78eb.png`;
const imgArrowRight = `${assetPathPrefix}/b72a5.svg`;
const imgArrowLeft = `${assetPathPrefix}/a3150.svg`;
const imgGroup1 = `${assetPathPrefix}/32d5a.svg`;
const imgLogoSollux = `${assetPathPrefix}/1cd05.svg`;
const imgAngleDown = `${assetPathPrefix}/076bd.svg`;
const imgSearch = `${assetPathPrefix}/3706b.svg`;
const imgCube = `${assetPathPrefix}/b15cc.svg`;
const imgUser = `${assetPathPrefix}/8b68e.svg`;
const imgGroup = `${assetPathPrefix}/43a24.svg`;
const imgGroup2 = `${assetPathPrefix}/f7239.svg`;

export default function HeroBaner() {
  return (
    <div className="content-stretch flex items-center justify-center px-[16px] relative size-full" data-node-id="1:506" data-name="HERO Baner">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHeroBaner} />
      <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center max-w-[1600px] min-w-px overflow-clip py-[64px] relative" data-node-id="1:507" data-name="Container">
        <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-node-id="1:508" data-name="Content">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start relative shrink-0 text-white w-full" data-node-id="1:509" data-name="Title">
            <p className="font-['Red_Hat_Display:Medium'] font-medium leading-[1.2] relative shrink-0 text-[16px] w-full" data-node-id="1:510">
              Bestsellery SOLLUX
            </p>
            <div className="font-['Red_Hat_Display:Bold'] font-bold leading-[0] relative shrink-0 text-[56px] w-full" data-node-id="1:511">
              <p className="leading-none mb-0">Kolor i forma</p>
              <p className="leading-none">w nowym świetle</p>
            </div>
          </div>
          <div className="bg-[#f2bf25] content-stretch flex items-center justify-center px-[24px] py-[16px] relative rounded-[100px] shrink-0" data-node-id="1:512" data-name="Button">
            <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[#1e1e1e] text-[16px] text-center whitespace-nowrap" data-node-id="1:513">
              Sprawdź bestsellery
            </p>
          </div>
        </div>
      </div>
      <div className="-translate-y-1/2 absolute bg-[rgba(16,16,17,0.2)] content-stretch flex items-center justify-center right-[72px] rounded-[100px] size-[48px] top-1/2" data-node-id="1:514" data-name="Circle button">
        <div className="relative shrink-0 size-[24px]" data-node-id="1:515" data-name="arrow-right">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} />
        </div>
      </div>
      <div className="absolute bg-[rgba(16,16,17,0.2)] content-stretch flex items-center justify-center left-[72px] rounded-[100px] size-[48px] top-[516px]" data-node-id="1:517" data-name="Circle button">
        <div className="relative shrink-0 size-[24px]" data-node-id="1:518" data-name="arrow-left">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowLeft} />
        </div>
      </div>
      <div className="-translate-x-1/2 absolute bottom-[32px] content-stretch flex gap-[4px] items-center left-1/2" data-node-id="1:520" data-name="Progress bar">
        <div className="bg-[#f2bf25] h-[2px] relative shrink-0 w-[64px]" data-node-id="1:521" data-name="Div" />
        <div className="bg-[rgba(231,231,231,0.5)] h-[2px] relative shrink-0 w-[64px]" data-node-id="1:522" data-name="Div" />
      </div>
      <div className="absolute bg-[rgba(16,16,17,0.4)] bottom-[32px] content-stretch flex gap-[12px] items-center px-[24px] py-[12px] right-[72px] rounded-[100px]" data-node-id="1:524" data-name="Trustmate badge">
        <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-node-id="1:525" data-name="Rate">
          <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.1] relative shrink-0 text-[21px] text-white whitespace-nowrap" data-node-id="1:526">
            4.8
          </p>
          <div className="overflow-clip relative shrink-0 size-[20px]" data-node-id="1:527">
            <div className="absolute inset-[7.9%_12.5%_8.76%_16.67%]" data-node-id="1:528">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
            </div>
          </div>
        </div>
        <p className="[word-break:break-word] font-['Red_Hat_Display:Medium'] font-medium leading-[1.1] relative shrink-0 text-[13px] text-white whitespace-nowrap" data-node-id="1:532">
          Uwielbiany przez klientów
        </p>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex flex-col items-center justify-center left-1/2 p-[16px] top-0 w-[1920px]" data-node-id="1:533" data-name="Navbar">
        <div className="content-stretch flex gap-[64px] items-center max-w-[1600px] relative shrink-0 w-full" data-node-id="1:534" data-name="Content">
          <div className="content-stretch flex gap-[64px] items-center relative shrink-0" data-node-id="1:535" data-name="Logo + Links">
            <div className="h-[48px] relative shrink-0 w-[150px]" data-node-id="1:536" data-name="Logo SOLLUX">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLogoSollux} />
            </div>
            <div className="content-stretch flex gap-[32px] items-center max-w-[1600px] relative shrink-0" data-node-id="1:544" data-name="Links">
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-node-id="1:545" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:546" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:547">
                    Lampy
                  </p>
                </div>
                <div className="relative shrink-0 size-[16px]" data-node-id="1:548" data-name="angle-down">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAngleDown} />
                </div>
              </div>
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-node-id="1:550" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:551" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:552">
                    Kolory
                  </p>
                </div>
                <div className="relative shrink-0 size-[16px]" data-node-id="1:553" data-name="angle-down">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAngleDown} />
                </div>
              </div>
              <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-node-id="1:555" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:556" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:557">
                    Pomieszczenia
                  </p>
                </div>
                <div className="relative shrink-0 size-[16px]" data-node-id="1:558" data-name="angle-down">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgAngleDown} />
                </div>
              </div>
              <div className="content-stretch flex items-center relative shrink-0" data-node-id="1:560" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:561" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:562">
                    Nowości
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-center relative shrink-0" data-node-id="1:563" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:564" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:565">
                    Bestsellery
                  </p>
                </div>
              </div>
              <div className="content-stretch flex items-center relative shrink-0" data-node-id="1:566" data-name="Mini button">
                <div className="content-stretch flex items-center justify-center relative shrink-0" data-node-id="1:567" data-name="Link text">
                  <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] relative shrink-0 text-[14px] text-white whitespace-nowrap" data-node-id="1:568">
                    Promocje
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="border border-[#e7e7e7] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px px-[24px] py-[16px] relative rounded-[100px]" data-node-id="1:569" data-name="Search">
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-node-id="1:570" data-name="Content">
              <p className="[word-break:break-word] flex-[1_0_0] font-['Red_Hat_Display:Bold'] font-bold leading-[1.2] min-w-px relative text-[14px] text-white" data-node-id="1:571">
                Czego szukasz?
              </p>
              <div className="relative shrink-0 size-[20px]" data-node-id="1:572" data-name="search">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSearch} />
              </div>
            </div>
          </div>
          <div className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0" data-node-id="1:574" data-name="Ikony">
            <div className="content-stretch flex gap-[9px] items-center px-[16px] py-[11px] relative rounded-[100px] shrink-0" data-node-id="1:575" data-name="Konfigurator">
              <div className="relative shrink-0 size-[20px]" data-node-id="1:576" data-name="cube">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgCube} />
              </div>
              <p className="[word-break:break-word] font-['Red_Hat_Display:Bold'] font-bold leading-[1.1] relative shrink-0 text-[13px] text-white whitespace-nowrap" data-node-id="1:578">
                Stwórz swoją lampę
              </p>
            </div>
            <div className="content-stretch flex items-center justify-center relative rounded-[100px] shrink-0 size-[48px]" data-node-id="1:579" data-name="Circle button">
              <div className="relative shrink-0 size-[24px]" data-node-id="1:580" data-name="user">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgUser} />
              </div>
            </div>
            <div className="content-stretch flex items-center justify-center relative rounded-[100px] shrink-0 size-[48px]" data-node-id="1:585" data-name="Basket navi icon">
              <div className="overflow-clip relative shrink-0 size-[24px]" data-node-id="1:586" data-name="Custom Icons">
                <div className="absolute inset-[0_3.13%_-6.25%_3.13%] overflow-clip" data-node-id="1:587" data-name="ikona_koszyk 1">
                  <div className="absolute contents inset-[0_0.41%_0.29%_0]" data-node-id="1:588" data-name="Clip path group">
                    <div className="absolute inset-[12.46%_0.37%_13.17%_-0.01%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0.003px_-3.178px] mask-size-[22.408px_25.425px]" data-node-id="1:591" style={{ maskImage: `url("${imgGroup}")` }} data-name="Group">
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
