from flask import Flask, render_template, request, redirect, url_for, flash, abort, jsonify
from datetime import datetime, timedelta
import sqlite3
import os
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo, ValidationError
import pytz
from markupsafe import Markup
import dotenv

dotenv.load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # 使用安全的随机字符串
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
app.config['REMEMBER_COOKIE_DURATION'] = timedelta(days=30)  # 保持登录30天
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


# 修改时间过滤器，确保正确处理时区
@app.template_filter('format_datetime')
def format_datetime(dt):
    if not dt:
        return ""
    # 确保时间是北京时区
    beijing_tz = pytz.timezone('Asia/Shanghai')
    # 如果时间没有时区信息，假设它是UTC时间，然后转换到北京时间
    if dt.tzinfo is None:
        # 先将其视为UTC时间
        dt = dt.replace(tzinfo=pytz.UTC)
        # 然后转换到北京时间
        dt = dt.astimezone(beijing_tz)
    elif dt.tzinfo != beijing_tz:
        # 如果有时区但不是北京时区，转换到北京时区
        dt = dt.astimezone(beijing_tz)
    # 格式化为易读的时间格式
    return dt.strftime('%Y-%m-%d %H:%M:%S')

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=True)
    # 使用UTC时间存储，显示时再转换
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    notes = db.relationship('Note', backref='author', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class LoginForm(FlaskForm):
    username = StringField('用户名', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('密码', validators=[DataRequired()])
    submit = SubmitField('登录')

class RegisterForm(FlaskForm):
    username = StringField('用户名', validators=[DataRequired(), Length(min=4, max=20)])
    password = PasswordField('密码', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('确认密码', validators=[
        DataRequired(),
        EqualTo('password', message='两次输入的密码不匹配')
    ])
    submit = SubmitField('注册')

    def validate_username(self, field):
        if User.query.filter_by(username=field.data).first():
            raise ValidationError('用户名已被使用')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and check_password_hash(user.password_hash, form.password.data):
            login_user(user, remember=request.form.get('remember') == 'on')
            return redirect(url_for('index'))
        flash('用户名或密码错误')
    return render_template('login.html', form=form)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(username=form.username.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('注册成功，请登录')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/')
@login_required
def index():
    notes = Note.query.filter_by(user_id=current_user.id).order_by(Note.updated_at.desc()).all()
    return render_template('index.html', notes=notes)

@app.route('/note/<int:note_id>')
@login_required
def view_note(note_id):
    print(f"正在查看笔记 ID: {note_id}")
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        flash('您没有权限查看这个笔记')
        return redirect(url_for('index'))
    # 直接重定向到编辑页面
    return redirect(url_for('edit_note', note_id=note_id))

@app.route('/note/<int:note_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_note(note_id):
    note = Note.query.get_or_404(note_id)
    
    if note.user_id != current_user.id:
        flash('您没有权限编辑此笔记', 'danger')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        note.title = request.form.get('title')
        note.content = request.form.get('content')
        # 使用UTC时间
        note.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': True, 'message': '笔记已保存'})
        
        flash('笔记已更新', 'success')
        return redirect(url_for('view_note', note_id=note.id))
    
    # 检查当前笔记内容是否为空
    is_content_empty = not note.content or note.content.strip() == ''
    
    return render_template('edit.html', note=note, is_content_empty=is_content_empty)

@app.route('/note/<int:note_id>/delete', methods=['POST'])
@login_required
def delete_note(note_id):
    note = Note.query.get_or_404(note_id)
    if note.user_id != current_user.id:
        flash('您没有权限删除这个笔记')
        return redirect(url_for('index'))
    db.session.delete(note)
    db.session.commit()
    flash('笔记已删除')
    return redirect(url_for('index'))


@app.route('/api/note/<int:note_id>/content')
@login_required
def get_note_content(note_id):
    """获取笔记的完整内容"""
    note = Note.query.filter_by(id=note_id, user_id=current_user.id).first()
    
    if not note:
        return jsonify({'error': '笔记不存在或无权限访问'}), 404
    
    return jsonify({
        'id': note.id,
        'title': note.title,
        'content': note.content or ''
    })

@app.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form.get('content', '')
        
        if not title:
            flash('标题不能为空')
            return redirect(url_for('create'))
            
        note = Note(
            title=title,
            content=content,
            user_id=current_user.id,
            # 使用UTC时间，显示时再转换
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(note)
        db.session.commit()
        flash('笔记已创建')
        return redirect(url_for('index'))
    return render_template('create.html')


if __name__ == '__main__':
    with app.app_context():
        # 只在首次运行时创建表
        db.create_all()  # 创建表（如果不存在）
        db.session.commit()

    env = os.getenv('FLASK_ENV', 'development')
    print(f"当前环境: {env}")
    
    if env == 'production':
        ssl_context = (
            '/etc/ssl/certs/fullchain.pem',
            '/etc/ssl/certs/privkey.pem'
        )
        app.debug = True
        app.run(host='0.0.0.0', port=5000, ssl_context=ssl_context)
    else:
        # 开发环境启用调试模式
        app.debug = True
        app.run(host='0.0.0.0', port=5000) 


