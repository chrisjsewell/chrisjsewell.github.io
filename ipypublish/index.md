**Documentation Moved To: http://ipypublish.readthedocs.io**

A workflow for creating and editing publication ready scientific reports and presentations, 
from one or more Jupyter Notebooks, without leaving the browser!

![](example_workflow.gif)

See [Example.pdf](https://chrisjsewell.github.io/ipypublish/Example.view_pdf.html),
[Example.html](https://chrisjsewell.github.io/ipypublish/Example.html) and 
[Example.slides.html](https://chrisjsewell.github.io/ipypublish/Example.slides.html#/) for an example of the potential outputs.

Or, for a practical example of the ipypublish capability, see these documents on Atomic 3D Visualisation: 
[Notebook](https://github.com/chrisjsewell/chrisjsewell.github.io/blob/master/3d_atomic/3D%20Atomic%20Visualisation.ipynb), [PDF](https://chrisjsewell.github.io/3d_atomic/converted/3D Atomic Visualisation.view_pdf.html), [HTML](https://chrisjsewell.github.io/3d_atomic/converted/3D%20Atomic%20Visualisation.html) or [Reveal.JS slideshow](https://chrisjsewell.github.io/3d_atomic/converted/3D Atomic Visualisation.slides.html).

* TOC
{:toc}

## Design Philosophy

In essence, the dream is to have the ultimate hybrid of Jupyter Notebook, WYSIWYG editor (e.g. MS Word) and document preparation system (e.g. [TexMaker](http://www.xm1math.net/texmaker/)), being able to:

- Dynamically (and reproducibly) explore data, run code and output the results
- Dynamically edit and visualise the basic components of the document (text, math, figures, tables, references, citations, etc).
- Have precise control over what elements are output to the final document and how they are layed out and typeset.
     - Also be able to output the same source document to different layouts and formats (pdf, html, presentation slides, etc).