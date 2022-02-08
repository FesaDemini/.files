set number
set tabstop=8
set shiftwidth=2
set mouse=a
set noshowmode
set laststatus=2

call plug#begin('~/.config/nvim/autoload/plugged')

Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'ryanoasis/vim-devicons'
Plug 'jiangmiao/auto-pairs'
Plug 'kevinhwang91/rnvimr'
Plug 'vim-airline/vim-airline'
Plug 'vim-airline/vim-airline-themes'

call plug#end()

colorscheme solarized
set background=dark

hi Normal guibg=NONE ctermbg=NONE
hi LineNr ctermfg=NONE ctermbg=NONE

nnoremap <C-f> :RnvimrToggle<CR>
