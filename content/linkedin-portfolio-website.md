# LinkedIn Portfolio Website

## TOC

- [LinkedIn Portfolio Website](#linkedin-portfolio-website)
  - [TOC](#toc)
  - [Explanation](#explanation)
  - [How-to](#how-to)
    - [Set-up](#set-up)
    - [Webhooks](#webhooks)
    - [Google Analytics](#google-analytics)
  - [Questions and/or suggestions](#questions-andor-suggestions)
  - [About](#about)

## Explanation

This Google spreadsheet add-on enhances a document to serve as the back-end of a website, based on data of a [LinkedIn](https://linkedin.com) export.
The resulting [website](https:/johannroehl.de/?utm-source={{UTM_SOURCE}}) is hosted with [Netlify](https://netlify.com) and customisable to a certain extent with the help of the worksheet data.

## How-to

> An example setup can be found [here](https://docs.google.com/spreadsheets/d/e/2PACX-1vQuecALT8pHKju0b9kySsihxURUocdrhjIbw2kmqB0D7VALDMdm0DlI7gZApVjZMzWO-wFaXEPG0jg4/pubhtml)

### Set-up

1. Install add-on in Google spreadsheet
2. Open the **"LinkedIn Portfolio"** menu entry
3. Click **"Setup"**
4. Go to [LinkedIn export page](https://www.linkedin.com/psettings/member-data)
5. Export _"the works"_
6. Create **"SECTIONS"** worksheet _(This overwrites all data in the existing **"SECTIONS"** worksheet)_
7. Import files _(this overwrites all data in the import worksheets)_
8. Publish spreadsheet to the web
9. Add the spreadsheet id during Netlify deploy
10. Adjust **"SECTIONS"** settings or data worksheets

### Webhooks

You can add webhook urls to your document that are triggered when something is changed in the spreadsheet. These can for example be used to trigger a rebuild of the website, using Netlify build hooks.

1. Open the **"LinkedIn Portfolio"** menu entry
2. Click **"Webhooks"**
3. Add webhook details

### Google Analytics

If you want to use google analytics, you can add the **"GOOGLE_ANALYTICS"** environment variable (containing your *UA-XXXXX* tracking code) to Netlify. When this environment variable is set, google analytics will be installed (on the next build), a [privacy-policy](/privacy-policy) sub-page created and various events send during use of the page.

## Questions and/or suggestions

Your questions and/or suggestions are always welcome - either file an [issue](https://github.com/jroehl/web.linkedin-portfolio/issues) or shoot me a [mail](mailto:mail@johannroehl.de).

## About

LinkedIn Portfolio  
*by* Johann Röhl

[mail@johannroehl.de](mailto:mail@johannroehl.de)

[Frontend Repository](https://github.com/jroehl/web.linkedin-portfolio)  
[Sheets (Backend) Repository](http://github.com/jroehl/linkedin-portfolio-backend/)  

© 2013 - 2019 [johannroehl](https:/johannroehl.de/?utm-source={{UTM_SOURCE}})