let SessionLoad = 1
if &cp | set nocp | endif
let s:cpo_save=&cpo
set cpo&vim
inoremap <silent> <Plug>NERDCommenterInsert  <BS>:call NERDComment('i', "insert")
noremap  :find ./**/
nnoremap  :%s//gc<Left><Left><Left>
vmap  y0/
nmap  yiw0/
nnoremap <NL> ddp
nnoremap  ddkP
noremap  <Up>o<Down>
nnoremap <silent>  :cnzvzz
nnoremap <silent>  :cpzvzz
nnoremap   i <Right>
nnoremap * *N:%s///gn
noremap FF :grep -r 
nnoremap N Nzz
nnoremap Q :sh
nmap \ca <Plug>NERDCommenterAltDelims
xmap \cu <Plug>NERDCommenterUncomment
nmap \cu <Plug>NERDCommenterUncomment
xmap \cb <Plug>NERDCommenterAlignBoth
nmap \cb <Plug>NERDCommenterAlignBoth
xmap \cl <Plug>NERDCommenterAlignLeft
nmap \cl <Plug>NERDCommenterAlignLeft
nmap \cA <Plug>NERDCommenterAppend
xmap \cy <Plug>NERDCommenterYank
nmap \cy <Plug>NERDCommenterYank
xmap \cs <Plug>NERDCommenterSexy
nmap \cs <Plug>NERDCommenterSexy
xmap \ci <Plug>NERDCommenterInvert
nmap \ci <Plug>NERDCommenterInvert
nmap \c$ <Plug>NERDCommenterToEOL
xmap \cn <Plug>NERDCommenterNested
nmap \cn <Plug>NERDCommenterNested
xmap \cm <Plug>NERDCommenterMinimal
nmap \cm <Plug>NERDCommenterMinimal
xmap \c  <Plug>NERDCommenterToggle
nmap \c  <Plug>NERDCommenterToggle
xmap \cc <Plug>NERDCommenterComment
nmap \cc <Plug>NERDCommenterComment
nnoremap \cv Hv:set scbwLzt5:set scb
nnoremap \; w
nnoremap \b b
nnoremap \t t
nnoremap \l <Right>
nnoremap \h <Left>
nnoremap \j <Down>
nnoremap \k <Up>
nnoremap \= =
noremap \<Left> <
noremap \<Right> >
noremap \<Down> -
noremap \<Up> +
nnoremap \s :exe "resize " . (winheight(0) * 2/3)
nnoremap \w :exe "resize " . (winheight(0) * 3/2)
nnoremap \a :exe "vertical resize " . (winwidth(0) * 2/3)
nnoremap \d :exe "vertical resize " . (winwidth(0) * 3/2)
nnoremap \Q :only
noremap \q :qa!
vmap gx <Plug>NetrwBrowseXVis
nmap gx <Plug>NetrwBrowseX
nnoremap n nzz
vnoremap sc< da<BS><BS><><Left>p
vnoremap sc{ da<BS><BS>{}<Left>p
vnoremap sc[ da<BS><BS>[]<Left>p
vnoremap sc( da<BS><BS>()<Left>p
vnoremap sc` da<BS><BS>``<Left>p
vnoremap sc' da<BS><BS>''<Left>p
vnoremap sc" da<BS><BS>""<Left>p
vnoremap sd da<BS><BS>p
vnoremap s< di<><Left>p
vnoremap s{ di{}<Left>p
vnoremap s[ di[]<Left>p
vnoremap s( di()<Left>p
vnoremap s` di``<Left>p
vnoremap s' di''<Left>p
vnoremap s" di""<Left>p
nnoremap z{ [{zf%
vnoremap <silent> <Plug>NetrwBrowseXVis :call netrw#BrowseXVis()
nnoremap <silent> <Plug>NetrwBrowseX :call netrw#BrowseX(netrw#GX(),netrw#CheckIfRemote(netrw#GX()))
xnoremap <silent> <Plug>NERDCommenterUncomment :call NERDComment("x", "Uncomment")
nnoremap <silent> <Plug>NERDCommenterUncomment :call NERDComment("n", "Uncomment")
xnoremap <silent> <Plug>NERDCommenterAlignBoth :call NERDComment("x", "AlignBoth")
nnoremap <silent> <Plug>NERDCommenterAlignBoth :call NERDComment("n", "AlignBoth")
xnoremap <silent> <Plug>NERDCommenterAlignLeft :call NERDComment("x", "AlignLeft")
nnoremap <silent> <Plug>NERDCommenterAlignLeft :call NERDComment("n", "AlignLeft")
nnoremap <silent> <Plug>NERDCommenterAppend :call NERDComment("n", "Append")
xnoremap <silent> <Plug>NERDCommenterYank :call NERDComment("x", "Yank")
nnoremap <silent> <Plug>NERDCommenterYank :call NERDComment("n", "Yank")
xnoremap <silent> <Plug>NERDCommenterSexy :call NERDComment("x", "Sexy")
nnoremap <silent> <Plug>NERDCommenterSexy :call NERDComment("n", "Sexy")
xnoremap <silent> <Plug>NERDCommenterInvert :call NERDComment("x", "Invert")
nnoremap <silent> <Plug>NERDCommenterInvert :call NERDComment("n", "Invert")
nnoremap <silent> <Plug>NERDCommenterToEOL :call NERDComment("n", "ToEOL")
xnoremap <silent> <Plug>NERDCommenterNested :call NERDComment("x", "Nested")
nnoremap <silent> <Plug>NERDCommenterNested :call NERDComment("n", "Nested")
xnoremap <silent> <Plug>NERDCommenterMinimal :call NERDComment("x", "Minimal")
nnoremap <silent> <Plug>NERDCommenterMinimal :call NERDComment("n", "Minimal")
xnoremap <silent> <Plug>NERDCommenterToggle :call NERDComment("x", "Toggle")
nnoremap <silent> <Plug>NERDCommenterToggle :call NERDComment("n", "Toggle")
xnoremap <silent> <Plug>NERDCommenterComment :call NERDComment("x", "Comment")
nnoremap <silent> <Plug>NERDCommenterComment :call NERDComment("n", "Comment")
nnoremap <M-F8> :call NextColor(0)
nnoremap <S-F8> :call NextColor(-1)
nnoremap <F8> :call NextColor(1)
noremap <S-Tab><Right> :tabn
noremap <S-Tab><Left> :tabp
noremap <S-Tab><Down> :tabc
noremap <S-Tab><Up> :tabnew
noremap <S-Tab> :tab
nnoremap <F2> :set invpaste paste?
inoremap  . f>a
inoremap  	 bdei <"></">F<i
inoremap , ,
inoremap ,  , 
inoremap , , 
inoremap [ [ D]<Left><Up>	ps
inoremap \w :w
inoremap { { D}<Left><Up>	ps
let &cpo=s:cpo_save
unlet s:cpo_save
set autoindent
set background=dark
set backspace=2
set expandtab
set exrc
set fileencodings=ucs-bom,utf-8,default,latin1
set helplang=en
set hlsearch
set laststatus=2
set modelines=0
set pastetoggle=<F2>
set runtimepath=~/.vim,~/.vim/bundle/nerdcommenter,~/.vim/bundle/nerdtree,~/.vim/bundle/syntastic,~/.vim/bundle/vim-jsbeautify,/usr/share/vim/vimfiles,/usr/share/vim/vim80,/usr/share/vim/vimfiles/after,~/.vim/after
set secure
set shiftwidth=4
set smarttab
set statusline=%m<%{winnr()}>\ %f\ %P:%c
set window=0
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd ~/mh/express-mysql-session
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +1 index.js
badd +0 package.json
argglobal
silent! argdel *
$argadd index.js
edit package.json
set splitbelow splitright
set nosplitbelow
set nosplitright
wincmd t
set winminheight=1 winheight=1 winminwidth=1 winwidth=1
argglobal
vnoremap <buffer> \ff :call RangeJsonBeautify()
nnoremap <buffer> \ff :call JsonBeautify()
onoremap <buffer> \ff :call JsonBeautify()
setlocal autoindent
setlocal backupcopy=
setlocal nobinary
setlocal nobreakindent
setlocal breakindentopt=
setlocal bufhidden=
setlocal buflisted
setlocal buftype=
setlocal nocindent
setlocal cinkeys=0{,0},0),:,0#,!^F,o,O,e
setlocal cinoptions=
setlocal cinwords=if,else,while,do,for,switch
setlocal colorcolumn=
setlocal comments=
setlocal commentstring=
setlocal complete=.,w,b,u,t,i
setlocal completefunc=
setlocal nocopyindent
setlocal cryptmethod=
setlocal nocursorbind
setlocal nocursorcolumn
set cursorline
setlocal cursorline
setlocal define=
setlocal dictionary=
setlocal nodiff
setlocal equalprg=
setlocal errorformat=
setlocal expandtab
if &filetype != 'json'
setlocal filetype=json
endif
setlocal fixendofline
set foldcolumn=3
setlocal foldcolumn=3
setlocal foldenable
setlocal foldexpr=0
setlocal foldignore=#
setlocal foldlevel=0
setlocal foldmarker={{{,}}}
setlocal foldmethod=manual
setlocal foldminlines=1
setlocal foldnestmax=20
setlocal foldtext=foldtext()
setlocal formatexpr=
setlocal formatoptions=cq
setlocal formatlistpat=^\\s*\\d\\+[\\]:.)}\\t\ ]\\s*
setlocal formatprg=
setlocal grepprg=
setlocal iminsert=0
setlocal imsearch=-1
setlocal include=
setlocal includeexpr=
setlocal indentexpr=
setlocal indentkeys=0{,0},:,0#,!^F,o,O,e
setlocal noinfercase
setlocal iskeyword=@,48-57,_,192-255
setlocal keywordprg=
setlocal nolinebreak
setlocal nolisp
setlocal lispwords=
setlocal nolist
setlocal makeencoding=
setlocal makeprg=
setlocal matchpairs=(:),{:},[:]
setlocal modeline
setlocal modifiable
setlocal nrformats=bin,octal,hex
set number
setlocal number
setlocal numberwidth=4
setlocal omnifunc=
setlocal path=
setlocal nopreserveindent
setlocal nopreviewwindow
setlocal quoteescape=\\
setlocal noreadonly
set relativenumber
setlocal relativenumber
setlocal noscrollbind
setlocal shiftwidth=4
setlocal noshortname
setlocal signcolumn=auto
setlocal nosmartindent
setlocal softtabstop=0
setlocal nospell
setlocal spellcapcheck=[.?!]\\_[\\])'\"\	\ ]\\+
setlocal spellfile=
setlocal spelllang=en
setlocal statusline=
setlocal suffixesadd=
setlocal swapfile
setlocal synmaxcol=3000
if &syntax != 'json'
setlocal syntax=json
endif
setlocal tabstop=8
setlocal tagcase=
setlocal tags=
setlocal textwidth=0
setlocal thesaurus=
setlocal noundofile
setlocal undolevels=-123456
setlocal nowinfixheight
setlocal nowinfixwidth
setlocal wrap
setlocal wrapmargin=0
silent! normal! zE
let s:l = 4 - ((3 * winheight(0) + 58) / 116)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
4
normal! 019|
tabnext 1
if exists('s:wipebuf')
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=1 winwidth=20 shortmess=filnxtToO
set winminheight=1 winminwidth=1
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
