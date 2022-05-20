type NormalMessageType = {
  step: number;
  message: string;
};

type SpecialMessageType = {
  total: number;
  message: string;
};

type ResType = {
  errCode: number;
  data: CounterType;
};

type CounterType = {
  total: number;
  today?: number;
  today_date?: string;
  yesterday?: number;
  yesterday_date?: string;
  this_week?: number;
  this_week_date?: string;
  last_week?: number;
  last_week_date?: string;
  this_month?: number;
  this_month_date?: string;
  last_month?: number;
  last_month_date?: string;
  this_year?: number;
  this_year_date?: string;
  last_year?: number;
  last_year_date?: string;
};

class NostalgicCounter {
  // class variables

  // class methods
  static async getCounter(id: string) {
    let counter = null;
    // const url = `http://localhost/api/counter?id=${id}`;
    const url = `https://nostalgic-counter-api.llll-ll.com/api/counter?id=${id}`;
    try {
      const res = await fetch(url).catch(() => null);
      if (res) {
        const json = (await res.json()) as ResType;
        if (json.errCode === 0) {
          counter = json.data;
        }
      }
    } catch (e) {
      console.error(e);
    }

    return counter;
  }

  static generateCounterHTML(
    counter: CounterType,
    formatting: string,
    zeroPaddingLength: number,
    imageDirPath: string,
    imageExt: string
  ) {
    let html = formatting;

    let totalHTML = NostalgicCounter.zeroPadding(counter.total, zeroPaddingLength);
    totalHTML = NostalgicCounter.convertTextsToImages(totalHTML, imageDirPath, imageExt);

    let todayHTML = String(counter.today);
    todayHTML = NostalgicCounter.convertTextsToImages(todayHTML, imageDirPath, imageExt);

    let yesterdayHTML = String(counter.yesterday);
    yesterdayHTML = NostalgicCounter.convertTextsToImages(yesterdayHTML, imageDirPath, imageExt);

    let thisWeekHTML = String(counter.this_week);
    thisWeekHTML = NostalgicCounter.convertTextsToImages(thisWeekHTML, imageDirPath, imageExt);

    let lastWeekHTML = String(counter.last_week);
    lastWeekHTML = NostalgicCounter.convertTextsToImages(lastWeekHTML, imageDirPath, imageExt);

    let thisMonthHTML = String(counter.this_month);
    thisMonthHTML = NostalgicCounter.convertTextsToImages(thisMonthHTML, imageDirPath, imageExt);

    let lastMonthHTML = String(counter.last_month);
    lastMonthHTML = NostalgicCounter.convertTextsToImages(lastMonthHTML, imageDirPath, imageExt);

    let thisYearHTML = String(counter.this_year);
    thisYearHTML = NostalgicCounter.convertTextsToImages(thisYearHTML, imageDirPath, imageExt);

    let lastYearHTML = String(counter.last_year);
    lastYearHTML = NostalgicCounter.convertTextsToImages(lastYearHTML, imageDirPath, imageExt);

    html = html.replace(/{total}/g, `<span class="nc-total">${totalHTML}</span>`);
    html = html.replace(/{today}/g, `<span class="nc-today">${todayHTML}</span>`);
    html = html.replace(/{yesterday}/g, `<span class="nc-yesterday">${yesterdayHTML}</span>`);
    html = html.replace(/{this_week}/g, `<span class="nc-this-week">${thisWeekHTML}</span>`);
    html = html.replace(/{last_week}/g, `<span class="nc-last-week">${lastWeekHTML}</span>`);
    html = html.replace(/{this_month}/g, `<span class="nc-this-month">${thisMonthHTML}</span>`);
    html = html.replace(/{last_month}/g, `<span class="nc-last-month">${lastMonthHTML}</span>`);
    html = html.replace(/{this_year}/g, `<span class="nc-this-year">${thisYearHTML}</span>`);
    html = html.replace(/{last_year}/g, `<span class="nc-last-year">${lastYearHTML}</span>`);
    html = `<span class="nostalgic-counter">${html}</span>`;

    return html;
  }

  static generateKiribanHTML(
    total: number,
    normalMessages: NormalMessageType[],
    specialMessages: SpecialMessageType[],
    noKiribanMessage: string,
    noMoreKiribanMessage: string,
    nextKiribanMessage: string
  ) {
    let html = "";

    let normalFound = normalMessages.find((m) => {
      return total % m.step === 0;
    });
    if (normalFound) {
      html += normalFound.message;
      html = html.replace(/{step}/g, `<span class="nc-step">${normalFound.step}</span>`);
    }

    let specialFound = specialMessages.find((m) => {
      return total === m.total;
    });
    if (specialFound) {
      html += specialFound.message;
    }

    if (!normalFound && !specialFound) {
      html += noKiribanMessage;
    }

    let next = Number.MAX_VALUE;
    if (nextKiribanMessage !== "") {
      let normalNext = Number.MAX_VALUE;
      // minBy
      normalFound = normalMessages.reduce((prev, item) => {
        return prev.step < item.step ? prev : item;
      });
      if (normalFound) {
        const minStep = normalFound.step;
        normalNext = total + minStep - (total % minStep);
      }

      let specialNext = Number.MAX_VALUE;
      specialFound = specialMessages.find((m) => {
        return total < m.total;
      });
      if (specialFound) {
        specialNext = specialFound.total;
      }

      // min
      const found = [normalNext, specialNext].reduce((prev, item) => {
        return prev < item ? prev : item;
      });
      if (found) {
        next = found;
      }
    }

    if (next === Number.MAX_VALUE) {
      html += noMoreKiribanMessage;
    } else {
      html += nextKiribanMessage;
      html = html.replace(/{next}/g, `<span class="nc-next">${next}</span>`);
    }

    html = html.replace(/{count}/g, `<span class="nc-count">${total}</span>`);
    html = html.replace(/{raw_count}/g, String(total));
    html = `<span class="nostalgic-counter">${html}</span>`;

    return html;
  }

  private static zeroPadding(count: number, length: number) {
    if (String(count).length < length) {
      return ("0000000000" + count).slice(-length);
    }

    return String(count);
  }

  private static convertTextsToImages(countText: string, imageDirPath: string, imageExt: string) {
    let html = countText;
    if (imageDirPath !== "") {
      const imagePaths = NostalgicCounter.convertNumbersToImagePaths(countText, imageDirPath, imageExt);
      html = imagePaths
        .map((p) => {
          return `<img src="${p}" />`;
        })
        .join("");
    }

    return html;
  }

  private static convertNumbersToImagePaths(countText: string, imageDirPath: string, imageExt: string) {
    const splited = String(countText).split("");
    return splited.map((n) => {
      return `${imageDirPath}/${n}${imageExt}`;
    });
  }
}

const onLoad = async () => {
  console.log("onLoad");

  const counters: any = {};
  const counterEles = document.querySelectorAll<HTMLAnchorElement>(".nostalgic_counter");
  for (const counterEle of counterEles) {
    const id = counterEle.dataset.id || "default";
    const formatting = counterEle.dataset.formatting || "{total}";
    const zeroPaddingLength = Number(counterEle.dataset.zeroPaddingLength) || 0;
    const imageDirPath = counterEle.dataset.imageDirPath || "";
    const imageExt = counterEle.dataset.imageExt || ".gif";

    let counter = null;
    if (id in counters) {
      counter = counters[id];
    } else {
      counter = await NostalgicCounter.getCounter(id);
    }

    if (counter) {
      counters[id] = counter;
      const html = NostalgicCounter.generateCounterHTML(counter, formatting, zeroPaddingLength, imageDirPath, imageExt);
      counterEle.innerHTML = html;
    }
  }

  const kiribanEle = document.querySelector<HTMLAnchorElement>(".nostalgic_counter_kiriban");
  if (kiribanEle) {
    const id = kiribanEle.dataset.id || "default";

    let normalMessages: NormalMessageType[] = [];
    if (kiribanEle.dataset.normalMessages) {
      normalMessages = JSON.parse(kiribanEle.dataset.normalMessages);
    }

    let specialMessages: SpecialMessageType[] = [];
    if (kiribanEle.dataset.specialMessages) {
      specialMessages = JSON.parse(kiribanEle.dataset.specialMessages);
    }

    const noKiribanMessage = kiribanEle.dataset.noKiribanMessage || "";
    const noMoreKiribanMessage = kiribanEle.dataset.noMoreKiribanMessage || "";
    const nextKiribanMessage = kiribanEle.dataset.nextKiribanMessage || "";

    let counter = null;
    if (id in counters) {
      counter = counters[id];
    } else {
      counter = await NostalgicCounter.getCounter(id);
    }

    if (counter) {
      const html = NostalgicCounter.generateKiribanHTML(
        counter.total,
        normalMessages,
        specialMessages,
        noKiribanMessage,
        noMoreKiribanMessage,
        nextKiribanMessage
      );

      kiribanEle.innerHTML = html;
    }
  }
};

window.removeEventListener("load", onLoad);
window.addEventListener("load", onLoad);

export default NostalgicCounter;
