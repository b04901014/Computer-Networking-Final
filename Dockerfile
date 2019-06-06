FROM ubuntu:16.04

# ----------------------------------------------------------------------------
# Arguments, Environment Variables
# ----------------------------------------------------------------------------
ENV NGINX_VERSION nginx-1.16.0

# ----------------------------------------------------------------------------
# Install Required Packages
# ----------------------------------------------------------------------------
RUN apt-get update
RUN apt-get install -y --no-install-recommends \
                       software-properties-common \
                       vim \
                       git-core \
                       tmux \
                       libsndfile-dev \
                       libssl-dev \
                       curl \
                       build-essential \
                       wget \
                       zip \
                       unzip \
                       nodejs \
                       npm \
                       ca-certificates \
                       openssl \
                       libpcre3-dev \
                       zlib1g-dev

# ----------------------------------------------------------------------------
# Install Nginx with RTMP module
# ----------------------------------------------------------------------------
RUN mkdir -p /tmp/build/nginx && \
    cd /tmp/build/nginx && \
    wget -O ${NGINX_VERSION}.tar.gz https://nginx.org/download/${NGINX_VERSION}.tar.gz && \
    tar -zxvf ${NGINX_VERSION}.tar.gz

RUN mkdir -p /tmp/build/nginx-rtmp-module && \
    cd /tmp/build/nginx-rtmp-module && \
    wget -O nginx-rtmp-module.zip https://github.com/arut/nginx-rtmp-module/archive/master.zip && \
    unzip nginx-rtmp-module.zip 

RUN cd /tmp/build/nginx/${NGINX_VERSION} && \
    ./configure --with-threads \
                --with-http_ssl_module \
                --add-module=/tmp/build/nginx-rtmp-module/nginx-rtmp-module-master && \
    make && make install && \
    rm -rf /tmp/build

RUN wget https://raw.githubusercontent.com/JasonGiedymin/nginx-init-ubuntu/master/nginx -O /etc/init.d/nginx && \
    chmod +x /etc/init.d/nginx

# ----------------------------------------------------------------------------
# Install ffmpeg4
# ----------------------------------------------------------------------------
RUN add-apt-repository ppa:jonathonf/ffmpeg-4 && \
    apt-get update && \
    apt-get install -y ffmpeg

# ----------------------------------------------------------------------------
# Modify bashrc file, configure vimrc file
# ----------------------------------------------------------------------------
RUN echo 'export LC_ALL=en_US.UTF-8' >> ~/.bashrc && \
    echo 'export LANG=en_US.UTF-8' >> ~/.bashrc && \
    echo 'export LANGUAGE=en_US.UTF-8' >> ~/.bashrc && \
    echo 'nnoremap <C-Left> :tabprevious<CR>' >> ~/.vimrc && \
    echo 'nnoremap <C-Right> :tabnext<CR>' >> ~/.vimrc && \
    echo 'set expandtab' >> ~/.vimrc && \
    echo 'set shiftwidth=2' >> ~/.vimrc

WORKDIR /root/

EXPOSE 8888
EXPOSE 4444

CMD ["sleep", "infinity"]
